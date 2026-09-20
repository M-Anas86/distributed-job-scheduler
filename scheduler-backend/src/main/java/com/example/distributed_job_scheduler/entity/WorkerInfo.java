package com.example.distributed_job_scheduler.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerInfo {

    private String workerId;

    private LocalDateTime lastHeartbeat;

    private int runningJobs;
}