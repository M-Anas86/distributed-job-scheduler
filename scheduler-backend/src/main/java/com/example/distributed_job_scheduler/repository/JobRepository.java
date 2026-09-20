package com.example.distributed_job_scheduler.repository;

import com.example.distributed_job_scheduler.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatusAndScheduledAtLessThanEqual(
            Job.JobStatus status,
            LocalDateTime time
    );

    @Modifying
    @Query("""
    UPDATE Job j
    SET j.status = 'RUNNING',
        j.workerId = :workerId,
        j.lockedAt = :lockedAt,
        j.heartbeatAt = :lockedAt
    WHERE j.id = :id
    AND j.status = 'PENDING'
    """)
    int claimJob(
            @Param("id") Long id,
            @Param("workerId") String workerId,
            @Param("lockedAt") LocalDateTime lockedAt
    );

    @Modifying
    @Query("""
    UPDATE Job j
    SET j.status = 'PENDING',
        j.workerId = null,
        j.lockedAt = null,
        j.heartbeatAt = null
    WHERE j.status = 'RUNNING'
    AND j.heartbeatAt < :timeout
""")
    int releaseStaleJobs(
            @Param("timeout") LocalDateTime timeout
    );

    @Modifying
    @Query("""
    UPDATE Job j
    SET j.heartbeatAt = :heartbeatAt
    WHERE j.id = :jobId
    AND j.workerId = :workerId
    AND j.status = 'RUNNING'
""")
    int updateHeartbeat(
            Long jobId,
            String workerId,
            LocalDateTime heartbeatAt
    );

    @Query("""
    SELECT j FROM Job j
    WHERE j.status = :status
    AND j.scheduledAt <= :now
    AND (j.nextRetryAt IS NULL OR j.nextRetryAt <= :now)
    ORDER BY j.priority DESC
""")
    List<Job> findReadyJobs(
            @Param("status") Job.JobStatus status,
            @Param("now") LocalDateTime now
    );

    List<Job> findByStatus(Job.JobStatus status);

    @Modifying
    @Query("""
    UPDATE Job j
    SET j.status = 'PENDING',
        j.retryCount = 0,
        j.nextRetryAt = :now,
        j.workerId = null,
        j.lockedAt = null,
        j.heartbeatAt = null,
        j.completedAt = null
    WHERE j.id = :jobId
    AND j.status = 'DEAD'
""")
    int requeueDeadJob(
            @Param("jobId") Long jobId,
            @Param("now") LocalDateTime now
    );

    @Modifying
    @Query("""
UPDATE Job j
SET j.status = 'COMPLETED',
    j.completedAt = :completedAt
WHERE j.id = :jobId
AND j.workerId = :workerId
AND j.status = 'RUNNING'
""")
    int completeJob(
            @Param("jobId") Long jobId,
            @Param("workerId") String workerId,
            @Param("completedAt") LocalDateTime completedAt
    );

    @Modifying
    @Query("""
UPDATE Job j
SET j.status = 'CANCELLED',
    j.workerId = null,
    j.lockedAt = null,
    j.heartbeatAt = null
WHERE j.id = :jobId
AND (j.status = 'PENDING' OR j.status = 'RUNNING')
""")
    int cancelJob(
            @Param("jobId") Long jobId
    );

    @Query("""
SELECT j.status
FROM Job j
WHERE j.id = :jobId
AND j.workerId = :workerId
""")
    Job.JobStatus findJobStatus(
            @Param("jobId") Long jobId,
            @Param("workerId") String workerId
    );

    public List<Job> findAllByOrderByIdDesc();
}
