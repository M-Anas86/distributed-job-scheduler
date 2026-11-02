package com.example.distributed_job_scheduler.controller;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.services.DeadLetterQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DeadLetterQueueController {

    private final DeadLetterQueueService deadLetterQueueService;

    @GetMapping("/dead")
    public ResponseEntity<List<Job>> getDeadJobs() {

        return ResponseEntity.ok(
                deadLetterQueueService.getDeadJobs()
        );
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<String> retryDeadJob(
            @PathVariable Long id) {

        boolean requeued =
                deadLetterQueueService.requeueDeadJob(id);

        if (!requeued) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                "Job " + id + " moved from DEAD to PENDING"
        );
    }
}