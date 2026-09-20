package com.example.distributed_job_scheduler.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String payload;

    @Enumerated(EnumType.STRING)
    private JobStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;

    public enum JobStatus {
        PENDING,
        RUNNING,
        COMPLETED,
        FAILED,
        DEAD,
        CANCELLED
    }

    private String workerId;
    private LocalDateTime lockedAt;
    private LocalDateTime heartbeatAt;
    private int retryCount = 0;
    private int maxRetries = 3;
    private LocalDateTime nextRetryAt;
    private int priority = 1;
}
