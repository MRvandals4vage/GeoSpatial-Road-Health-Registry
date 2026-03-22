# GeoRoad DBMS Lab Integration Plan & Reviewer Guide

## 1. Dual-Database Integration Strategy

This document outlines the dual-database demonstration setup designed to fulfill your DBMS lab requirements while preserving the integrity of the live application.

**PostgreSQL/PostGIS (Production & Application Engine)**
- Serves as the real functional backend database.
- Powers the Spring Boot + React stack.
- Handles complex geospatial operations (SRID 4326), bounding box constraints, polygon queries, and production indexing.

**MySQL (Academic/Reviewer Demonstration Engine)**
- Serves *strictly* as an academic demonstration for reviewers.
- Contains an equivalent tabular schema adapted for MySQL spatial limitations.
- Houses all stored procedures, triggers, complex joins, and cursor scripts required for the DBMS lab grades.
- Is **not** connected to the Spring Boot application.

### Spring Boot Guidance
Spring Boot should **not** load or connect to MySQL. Keep your `application.properties`/`application.yml` pointing only to PostgreSQL:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/georoad
spring.datasource.driver-class-name=org.postgresql.Driver
```
By keeping MySQL scripts isolated in the `database/mysql` folder, your application remains unaffected. You can run these scripts directly via a MySQL client (like MySQL Workbench or DBeaver) for your demonstration.

---

## 2. Directory Structure Plan

```text
geo-road-monitor/
├── backend/                  # Java Spring Boot application
├── src/                      # React frontend
├── database/                 # Hand-written SQL scripts (DBMS Lab requirement)
│   ├── postgres/             # Reference schemas for the real app
│   │   └── 01_postgres_schema.sql
│   └── mysql/                # Reviewer Demonstration scripts (The Lab Deliverables)
│       ├── 01_mysql_schema.sql
│       ├── mysql_week4_queries.sql
│       ├── mysql_week5_queries.sql
│       └── mysql_week6_procedures.sql
```

---

## 3. PostgreSQL vs. MySQL Concept Mapping

| GeoRoad Concept | PostgreSQL/PostGIS (Production) | MySQL (Demonstration) |
|---|---|---|
| **Spatial Column Type** | `GEOMETRY(Point, 4326)` | `POINT` (SRID 4326 supported in MySQL 8) |
| **Spatial Distance** | `ST_Distance(geom::geography, ...)` | `ST_Distance_Sphere(geom, ...)` |
| **Check Constraints** | Native `CHECK (score >= 0)` | Native `CHECK (score >= 0)` (MySQL 8.0.16+) |
| **Set Operations** | `INTERSECT`, `EXCEPT` | `INTERSECT`, `EXCEPT` (MySQL 8.0.31+) / `NOT IN` |
| **Exception Handling** | `EXCEPTION WHEN ... THEN` | `DECLARE CONTINUE HANDLER FOR SQLEXCEPTION` |
| **Sequence Generation**| `SERIAL` or `GENERATED ALWAYS` | `AUTO_INCREMENT` |

---

## 4. Understanding Feature Limitations in MySQL

While the MySQL schema mirrors the project, there are practical differences because PostGIS is a fully featured geospatial engine, whereas MySQL's geospatial features are more basic:

1. **Complex Geometries & Projections:** PostGIS can natively cast geometry to geography to compute highly accurate distances across the earth's curved surface. MySQL relies on the simpler `ST_Distance_Sphere`.
2. **Geospatial Indexing:** PostGIS uses robust GiST indexing for spatial querying (like identifying which road a GPS coordinate snapped to). MySQL's Spatial Indexes (R-Trees) are limited to certain bounding box calculations.
3. **Trigger Behavior:** PostgreSQL allows triggers to execute `INSTEAD OF` for views and handles recursive triggers elegantly, making it capable of deeply complex spatial triggers. MySQL triggers are strictly `BEFORE` or `AFTER` on tables.

---

## 5. Reviewer-Facing Statement (Recommendation)

You can confidently present this paragraph or slide to your reviewers to clarify your architecture:

> **Project Architecture Statement:**
> *"The GeoRoad platform is fundamentally a geospatial application. As such, the live application (Spring Boot, React) relies entirely on PostgreSQL and PostGIS to handle spatial distance calculations, geometry types, and spatial indexing (GiST). However, to thoroughly demonstrate the classic DBMS concepts required by the lab syllabus—such as advanced triggers, cursors, procedures, and query formulation—we have authored a parallel MySQL implementation. The provided MySQL scripts operate on an identical schema and correctly execute all lab requirements within a MySQL environment, serving as an isolated, academic demonstration of relational database mastery."*
