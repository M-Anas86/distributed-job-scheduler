package com.example.distributed_job_scheduler.services;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.repository.JobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class JobClaimService {
    private final JobRepository jobRepository;

    @Transactional
    public boolean claimJob(Long jobId, String workerId){
        LocalDateTime now = LocalDateTime.now();

        int updateRows = jobRepository.claimJob(jobId, workerId, LocalDateTime.now());
        return updateRows == 1;
    }

    @Transactional
    public int releaseStaleJobs(LocalDateTime timeout) {
        return jobRepository.releaseStaleJobs(timeout);
    }

    @Transactional
    public boolean updateHeartbeat(Long jobId, String workerId){
        int updateRows = jobRepository.updateHeartbeat(jobId, workerId, LocalDateTime.now());
        return updateRows == 1;
    }

    @Transactional
    public boolean completedJob(Long jobID, String workerId){
        int updateRows = jobRepository.completeJob(jobID, workerId, LocalDateTime.now());
        return updateRows == 1;
    }

    @Transactional
    public boolean cancelJob(Long jobId){
        int updateRow = jobRepository.cancelJob(jobId);
        return updateRow == 1;
    }

    @Transactional
    public boolean isJobStillRunning(Long jobId, String workerId){
        Job.JobStatus status = jobRepository.findJobStatus(jobId, workerId);

        return status == Job.JobStatus.RUNNING;
    }
}
