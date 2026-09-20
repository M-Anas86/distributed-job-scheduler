package com.example.distributed_job_scheduler.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequest{
    private String name;
    private String payload;
    private LocalDateTime scheduledAt;
    private int priority;
}
