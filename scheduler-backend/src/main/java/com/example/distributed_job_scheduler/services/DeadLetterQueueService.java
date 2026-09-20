package com.example.distributed_job_scheduler.services;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.repository.JobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeadLetterQueueService {
    private final JobRepository jobRepository;

    public List<Job> getDeadJobs(){
        return jobRepository.findByStatus(Job.JobStatus.DEAD);
    }

    @Transactional
    public boolean requeueDeadJob(Long jobId){
        int updatedRows = jobRepository.requeueDeadJob(jobId, LocalDateTime.now());

        return updatedRows == 1;
    }
}
