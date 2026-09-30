package com.example.distributed_job_scheduler.worker;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.repository.JobRepository;
import com.example.distributed_job_scheduler.services.JobClaimService;
import com.example.distributed_job_scheduler.services.WorkerRegistryService;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class JobWorker {

    @Value("${scheduler.worker-id}")
    private String workerId;

    private final JobRepository jobRepository;
    private final JobClaimService jobClaimService;
    private final WorkerRegistryService workerRegistryService;

    // Minimum number of concurrent jobs
    private static final int MIN_WORKERS = 1;

    // Maximum number of concurrent jobs
    private static final int MAX_WORKERS = 10;

    // Dynamic worker pool
    private final ThreadPoolExecutor executorService =
            new ThreadPoolExecutor(
                    MIN_WORKERS,
                    MAX_WORKERS,
                    30,
                    TimeUnit.SECONDS,
                    new java.util.concurrent.SynchronousQueue<>(),
                    new ThreadPoolExecutor.CallerRunsPolicy()
            );

    /**
     * Checks whether a worker slot is available.
     */
    public boolean hasAvailableSlot() {
        return executorService.getActiveCount()
                < executorService.getMaximumPoolSize();
    }

    /**
     * Automatically adjusts the number of worker threads
     * according to the number of pending jobs.
     */
    public void adjustWorkerCount(int pendingJobs) {

        int desiredWorkers;

        if (pendingJobs <= 5) {
            desiredWorkers = 1;

        } else if (pendingJobs <= 15) {
            desiredWorkers = 2;

        } else if (pendingJobs <= 30) {
            desiredWorkers = 4;

        } else if (pendingJobs <= 50) {
            desiredWorkers = 6;

        } else {
            desiredWorkers = 10;
        }

        /*
         * ThreadPoolExecutor requires maximumPoolSize
         * to be changed before corePoolSize when increasing.
         */
        if (desiredWorkers > executorService.getCorePoolSize()) {

            executorService.setMaximumPoolSize(desiredWorkers);
            executorService.setCorePoolSize(desiredWorkers);

        } else if (desiredWorkers < executorService.getCorePoolSize()) {

            /*
             * When decreasing, core size must be changed
             * after maximum size.
             */
            executorService.setCorePoolSize(desiredWorkers);
            executorService.setMaximumPoolSize(desiredWorkers);
        }

        System.out.println(
                "Worker [" + workerId +
                        "] Auto Scaling → Pending Jobs: " +
                        pendingJobs +
                        " | Active Workers: " +
                        desiredWorkers
        );
    }

    /**
     * Submit a job for execution.
     */
    public boolean execute(Job job) {

        try {

            executorService.execute(() -> {

                try {

                    executeJob(job);

                } finally {

                    System.out.println(
                            "Worker [" + workerId +
                                    "] finished execution of Job ID : " +
                                    job.getId()
                    );
                }
            });

            return true;

        } catch (Exception e) {

            System.out.println(
                    "Worker [" + workerId +
                            "] could not submit Job ID : " +
                            job.getId()
            );

            return false;
        }
    }

    /**
     * Actual job execution.
     */
    private void executeJob(Job job) {

        String threadName =
                Thread.currentThread().getName();

        System.out.println(
                "Worker [" + workerId +
                        "] picked job ID : " +
                        job.getId() +
                        " | Thread : " +
                        threadName
        );

        try {

            System.out.println(
                    "Worker [" + workerId +
                            "] Executing job......."
            );

            System.out.println(
                    "Worker [" + workerId +
                            "] Job name : " +
                            job.getName()
            );

            System.out.println(
                    "Worker [" + workerId +
                            "] Payload : " +
                            job.getPayload()
            );

            // Simulate long-running job
            for (int i = 1; i <= 4; i++) {

                Thread.sleep(5000);

                boolean stillRunning =
                        jobClaimService.isJobStillRunning(
                                job.getId(),
                                workerId
                        );

                if (!stillRunning) {

                    System.out.println(
                            "Worker [" + workerId +
                                    "] job ID " +
                                    job.getId() +
                                    " was cancelled or ownership was lost. Stop execution"
                    );

                    return;
                }

                boolean heartbeatUpdated =
                        jobClaimService.updateHeartbeat(
                                job.getId(),
                                workerId
                        );

                if (heartbeatUpdated) {

                    System.out.println(
                            "Worker [" + workerId +
                                    "] ❤ Heartbeat sent for job ID " +
                                    job.getId() +
                                    " | Thread : " +
                                    threadName
                    );

                } else {

                    System.out.println(
                            "Worker [" + workerId +
                                    "] failed heartbeat for job ID " +
                                    job.getId()
                    );
                }
            }

            boolean completed =
                    jobClaimService.completedJob(
                            job.getId(),
                            workerId
                    );

            if (completed) {

                System.out.println(
                        "Worker [" + workerId +
                                "] Completed job ID : " +
                                job.getId() +
                                " | Thread " +
                                threadName
                );

            } else {

                System.out.println(
                        "Worker [" + workerId +
                                "] Not completed job ID : " +
                                job.getId() +
                                " because worker ownership was lost"
                );
            }

        } catch (Exception e) {

            handleJobFailure(job, e);
        }
    }

    /**
     * Handles retry and DLQ logic.
     */
    private void handleJobFailure(
            Job job,
            Exception e
    ) {

        job.setRetryCount(
                job.getRetryCount() + 1
        );

        long delaySeconds = 0;

        if (job.getRetryCount()
                < job.getMaxRetries()) {

            delaySeconds =
                    (long) Math.pow(
                            2,
                            job.getRetryCount() - 1
                    ) * 5;

            job.setNextRetryAt(
                    LocalDateTime.now()
                            .plusSeconds(delaySeconds)
            );

            job.setStatus(
                    Job.JobStatus.PENDING
            );

            job.setWorkerId(null);
            job.setLockedAt(null);
            job.setHeartbeatAt(null);

            jobRepository.save(job);

            System.out.println(
                    "Worker [" + workerId +
                            "] Job " +
                            job.getId() +
                            " failed. Retry " +
                            job.getRetryCount() +
                            "/" +
                            job.getMaxRetries() +
                            " scheduled after " +
                            delaySeconds +
                            " seconds."
            );

        } else {

            job.setStatus(
                    Job.JobStatus.DEAD
            );

            job.setWorkerId(null);
            job.setLockedAt(null);
            job.setHeartbeatAt(null);

            jobRepository.save(job);

            System.out.println(
                    "Worker [" + workerId +
                            "] Job " +
                            job.getId() +
                            " permanently failed after " +
                            job.getRetryCount() +
                            " attempts."
            );
        }

        e.printStackTrace();
    }

    /**
     * Gracefully shut down thread pool.
     */
    @PreDestroy
    public void shutdown() {

        System.out.println(
                "Worker [" + workerId +
                        "] shutting down thread pool..."
        );

        executorService.shutdown();
    }

    /**
     * Worker heartbeat.
     */
    @Scheduled(fixedRate = 5000)
    public void sendWorkerHeartbeat() {

        workerRegistryService.registerHeartbeat(
                workerId
        );

        System.out.println(
                "Worker [" + workerId +
                        "] ❤ Worker heartbeat sent"
        );
    }
}