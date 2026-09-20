package com.example.distributed_job_scheduler.services;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;

    public Job createJob(Job job) {
        job.setStatus(Job.JobStatus.PENDING);
        job.setCreatedAt(LocalDateTime.now());

        if (job.getScheduledAt() == null) {
            job.setScheduledAt(LocalDateTime.now());
        }
        return jobRepository.save(job);
    }

    public Job getJob(Long id){
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAllByOrderByIdDesc();
    }}
