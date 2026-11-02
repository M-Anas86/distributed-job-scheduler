package com.example.distributed_job_scheduler.controller;

import com.example.distributed_job_scheduler.dto.CreateJobRequest;
import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.services.JobClaimService;
import com.example.distributed_job_scheduler.services.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class JobController {
    private final JobService jobService;
    private final JobClaimService jobClaimService;

    @PostMapping
    public Job createJob(@RequestBody CreateJobRequest request){
        Job job = new Job();

        job.setName(request.getName());
        job.setPayload(request.getPayload());
        job.setScheduledAt(request.getScheduledAt());
        job.setPriority(request.getPriority());

        return jobService.createJob(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelJob(@PathVariable Long id){
        boolean cancelled = jobClaimService.cancelJob(id);

        if(cancelled){
            return ResponseEntity.ok("Job " + id + " cancelled successfully");
        }

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("Job "+ id + " can not be cancelled. It may already be completed, dead, or cancelled.");
    }

    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id){
        return jobService.getJob(id);
    }

    @GetMapping
    public List<Job> getAllJobs(){
        return jobService.getAllJobs();
    }
}
