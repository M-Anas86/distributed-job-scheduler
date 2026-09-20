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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

@Component
@RequiredArgsConstructor
public class JobWorker {

    @Value("${scheduler.worker-id}")
    private String workerId;

    private final JobRepository jobRepository;
    private final JobClaimService jobClaimService;
    private final WorkerRegistryService workerRegistryService;

    // Maximum 4 jobs can execute concurrently
    private final ExecutorService executorService =
            Executors.newFixedThreadPool(4);

    // 4 execution slots
    private final Semaphore executionSlots =
            new Semaphore(4);

    /**
     * Checks whether a thread/execution slot is available.
     */
    public boolean hasAvailableSlot() {
        return executionSlots.availablePermits() > 0;
    }

    /**
     * Submit a job for execution.
     */
    public boolean execute(Job job) {
        // Try to acquire an execution slot
        if (!executionSlots.tryAcquire()) {
            return false;
        }

        executorService.submit(() -> {
            try {
                executeJob(job);
            } finally {
                // Release the slot when the job finishes
                executionSlots.release();
            }
        });
        return true;
    }

    /**
     * Actual job execution.
     */
    private void executeJob(Job job) {

        String threadName = Thread.currentThread().getName();

        System.out.println("Worker [" + workerId + "] picked job ID : " + job.getId() + " | Thread : " + threadName);

        try {
            System.out.println("Worker [" + workerId + "] Executing job.......");

            System.out.println("Worker [" + workerId + "] Job name : " + job.getName());

            System.out.println("Worker [" + workerId + "] Payload : " + job.getPayload());

            // Simulate long-running job
            for (int i = 1; i <= 4; i++) {
                Thread.sleep(5000);

                boolean stillRunning = jobClaimService.isJobStillRunning(job.getId(), workerId);

                if(!stillRunning){
                    System.out.println("Worker [" + workerId + "] job ID " + job.getId() + " was cancelled or ownership was lost. Stop execution");
                    return;
                }

                boolean heartbeatUpdated = jobClaimService.updateHeartbeat(job.getId(), workerId);

                if (heartbeatUpdated) {
                    System.out.println("Worker [" + workerId + "] ❤ Heartbeat sent for job ID " +
                                    job.getId() + " | Thread : " + threadName);
                } else {
                    System.out.println("Worker [" + workerId + "] failed heartbeat for job ID " + job.getId());
                }
            }


            boolean completed = jobClaimService.completedJob(job.getId(), workerId);
            if(completed){
                System.out.println("Worker [" + workerId + "] Completed job ID : " + job.getId() + " | Thread " + threadName);
            }else{
                System.out.println("Worker [" + workerId + "] Not completed job ID : " + job.getId() + " because worker owneship was lost");
            }
//            // Mark job as completed
//            job.setStatus(Job.JobStatus.COMPLETED);
//            job.setCompletedAt(LocalDateTime.now());
//
//            jobRepository.save(job);
//            System.out.println("Worker [" + workerId + "] Completed job ID : " + job.getId() + " | Thread : " + threadName);

        } catch (Exception e) {
            handleJobFailure(job, e);
        }
    }

    /**
     * Handles retry and DLQ logic.
     */
    private void handleJobFailure(Job job, Exception e) {
        job.setRetryCount(job.getRetryCount() + 1);
        long delaySeconds = 0;

        if (job.getRetryCount() < job.getMaxRetries()) {
            delaySeconds = (long) Math.pow(2, job.getRetryCount() - 1) * 5;

            job.setNextRetryAt(LocalDateTime.now().plusSeconds(delaySeconds));
            job.setStatus(Job.JobStatus.PENDING);
            job.setWorkerId(null);
            job.setLockedAt(null);
            job.setHeartbeatAt(null);

            jobRepository.save(job);

            System.out.println("Worker [" + workerId + "] Job " + job.getId() + " failed. Retry " +
                            job.getRetryCount() + "/" + job.getMaxRetries() + " scheduled after " +
                            delaySeconds + " seconds.");
        } else {
            // Permanently failed → DLQ
            job.setStatus(Job.JobStatus.DEAD);

            job.setWorkerId(null);
            job.setLockedAt(null);
            job.setHeartbeatAt(null);

            jobRepository.save(job);

            System.out.println("Worker [" + workerId + "] Job " + job.getId() + " permanently failed after " +
                            job.getRetryCount() + " attempts.");
        }
        e.printStackTrace();
    }

    /**
     * Gracefully shut down thread pool.
     */
    @PreDestroy
    public void shutdown() {

        System.out.println("Worker [" + workerId + "] shutting down thread pool...");
        executorService.shutdown();
    }

    @Scheduled(fixedRate = 5000)
    public void sendWorkerHeartbeat() {

        workerRegistryService.registerHeartbeat(workerId);

        System.out.println(
                "Worker [" + workerId + "] ❤ Worker heartbeat sent"
        );
    }
}