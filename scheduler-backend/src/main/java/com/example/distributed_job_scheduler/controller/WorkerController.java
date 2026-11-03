package com.example.distributed_job_scheduler.controller;

import com.example.distributed_job_scheduler.entity.WorkerInfo;
import com.example.distributed_job_scheduler.services.WorkerRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workers")
@CrossOrigin(origins = "http://localhost:5173",
        originPatterns = "https://distributed-job-scheduler-12i1.vercel.app")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerRegistryService workerRegistryService;

    @GetMapping
    public List<WorkerInfo> getWorkers() {
        return workerRegistryService.getWorkers();
    }
}