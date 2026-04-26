# GeoRoad Rubric-Driven Implementation Plan

## PART 1: MAPPING RUBRIC TO APPLICATION FEATURES

### 1. Constraints, Aggregate Functions, and Set Operations
- **Feature**: **Dashboard & Analytics Page**
- **SQL Objects Created**: 
  - `locations`, `roads`, `condition_reports` with `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, and `CHECK (score >= 0 AND score <= 100)`.
  - Queries for aggregate metrics (total vs severe complaints, avg condition score, highest/lowest scores).
  - Queries using `UNION` (Alerts combining user reports and AI flags), `INTERSECT` (Severe roads intersecting with pending complaints), and `EXCEPT` (Pending complaints except those already being acted upon).
- **Backend Call**: `DbmsLabService.java` calls native queries defined in `DbmsLabRepository.java`.
- **Frontend Display**: 
  - Dashboard stats widgets for aggregate numbers.
  - Alerts page lists for the set operation alerts.

### 2. Complex Queries using Subqueries, Joins, and Views
- **Feature**: **Admin Complaints Page & Road Details/History Page**
- **SQL Objects Created**: 
  - **Views**: `road_status_summary` (Dashboard), `complaint_analysis_view` (Analytics), `severe_road_alert_view` (Alerts).
  - **Joins**: Multi-table INNER JOINS returning full complaint context (road, location, user info, model info). RIGHT JOIN demonstrating category completeness.
  - **Subqueries**: Correlated subquery to find most complained roads compared to average. Nested subqueries for locations with worst average health.
- **Backend Call**: `DbmsLabController.java` exposes REST endpoints mapped to `DbmsLabService.java` which hits views and subquery repository methods.
- **Frontend Display**:
  - Analytics Page plots condition_score against the regional average.
  - Admin Complaints Page consumes the `complaint_analysis_view`.

### 3. Queries using Functions, Triggers, Cursors, and Exception Handling
- **Feature**: **Alert Generation & Reporting Pipeline**
- **SQL Objects Created**:
  - **Functions/Procedures**: `get_avg_score_by_location` (function), `safe_insert_report` (procedure safely handling inserts with exception blocks).
  - **Triggers**: `update_road_condition_on_report` (automatically recalculates the road's average score when an approved report is added), `log_admin_resolution` (tracks status changes).
  - **Cursors**: `generate_severe_road_notices` (scans all roads locally loop-by-loop to generate severe notices).
- **Backend Call**: Endpoints `/api/dbms-demo/procedures/safe-insert` trigger the PL/pgSQL directly.
- **Frontend Display**:
  - Admin batch alert generation triggered by Cursor endpoint.
  - Safe mobile/app reporting uses the safe insert procedure.

## FRONTEND MAPPING
- **Dashboard**: Uses `/api/dbms-demo/stats/general` and `road_status_summary` view to display total severe complaints and general road categorization percentages.
- **Admin Complaints Page**: Uses `complaint_analysis_view` to populate the grid showing unresolved complaints, joining user/model/road data.
- **Analytics Page**: Uses Correlated Subqueries (`/analytics/most-complained`) to show trend analytics and most commonly broken roads compared to the average.
- **Alerts Page**: Uses Set Operations (UNION, INTERSECT) (`/alerts/union-alerts`) to group AI + Human severe flags into one table.
- **Road Details Page**: Hits the DB procedure `safe_insert_report` when a new condition is submitted to handle exceptions safely.
