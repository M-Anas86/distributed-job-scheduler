package com.example.distributed_job_scheduler.services;

import com.example.distributed_job_scheduler.entity.Job;
import com.example.distributed_job_scheduler.entity.WorkerInfo;
import com.example.distributed_job_scheduler.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class WorkerRegistryService {

    private final JobRepository jobRepository;

    private final Map<String, LocalDateTime> workerHeartbeats =
            new ConcurrentHashMap<>();

    public void registerHeartbeat(String workerId) {
        workerHeartbeats.put(workerId, LocalDateTime.now());
    }

    public List<WorkerInfo> getWorkers() {

        List<WorkerInfo> workers = new ArrayList<>();

        for (Map.Entry<String, LocalDateTime> entry :
                workerHeartbeats.entrySet()) {

            String workerId = entry.getKey();

            int runningJobs =
                    jobRepository.findByStatus(Job.JobStatus.RUNNING)
                            .stream()
                            .filter(job ->
                                    workerId.equals(job.getWorkerId()))
                            .toList()
                            .size();

            workers.add(
                    new WorkerInfo(
                            workerId,
                            entry.getValue(),
                            runningJobs
                    )
            );
        }

        return workers;
    }
}