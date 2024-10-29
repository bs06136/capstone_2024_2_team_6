package org.daniel.test111.repository;

import org.daniel.test111.entity.DataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DataRepository extends JpaRepository<DataEntity, Long> {

    @Query(value = "SELECT * FROM Data_Entity ORDER BY id DESC LIMIT 1", nativeQuery = true)
    DataEntity findLatestData();
}