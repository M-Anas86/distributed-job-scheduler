package com.example.distributed_job_scheduler.worker;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.repository.JobRepository;
import com.example.distributed_job_scheduler.services.JobClaimService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JobScheduler {

    private final JobClaimService jobClaimService;
    private final JobRepository jobRepository;
    private final JobWorker jobWorker;

    @Value("${scheduler.worker-id}")
    private String workerId;

    /**
     * Checks for pending jobs every 5 seconds.
     */
    @Scheduled(fixedRate = 5000)
    public void checkForJobs() {

        List<Job> jobs =
                jobRepository.findReadyJobs(
                        Job.JobStatus.PENDING,
                        LocalDateTime.now()
                );

        if (jobs.isEmpty()) {
            return;
        }

        jobWorker.adjustWorkerCount(jobs.size());

        System.out.println(
                "Job found : " + jobs.size()
        );

        for (Job job : jobs) {

            /*
             * Don't claim another job if all 4
             * execution slots are currently busy.
             */
            if (!jobWorker.hasAvailableSlot()) {

                System.out.println(
                        "Worker [" + workerId +
                                "] all execution slots are busy."
                );

                break;
            }

            /*
             * Atomically claim the job.
             */
            boolean claimed =
                    jobClaimService.claimJob(
                            job.getId(),
                            workerId
                    );

            if (!claimed) {

                System.out.println(
                        "Worker [" + workerId +
                                "] Job already claimed : " +
                                job.getId()
                );

                continue;
            }

            System.out.println(
                    "Worker [" + workerId +
                            "] claimed Job ID : " +
                            job.getId()
            );

            /*
             * Submit the claimed job to the thread pool.
             */
            boolean submitted =
                    jobWorker.execute(job);

            if (submitted) {

                System.out.println(
                        "Worker [" + workerId +
                                "] submitted Job ID : " +
                                job.getId()
                );

              }
//            else {
//
//                /*
//                 * This should normally not happen because
//                 * hasAvailableSlot() was checked above.
//                 */
//                System.out.println(
//                        "Worker [" + workerId +
//                                "] could not submit Job ID : " +
//                                job.getId()
//                );
//            }
        }
    }

    /**
     * Recover jobs whose heartbeat has become stale.
     *
     * Runs every 10 seconds.
     */
    @Scheduled(fixedRate = 10000)
    public void recoverStaleJobs() {

        LocalDateTime timeout =
                LocalDateTime.now()
                        .minusSeconds(30);

        int recovered =
                jobClaimService.releaseStaleJobs(
                        timeout
                );

        if (recovered > 0) {

            System.out.println(
                    "Recovered stale jobs: " +
                            recovered
            );
        }
    }
}