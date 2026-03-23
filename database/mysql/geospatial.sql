CREATE DATABASE road_condition_db;
USE road_condition_db;

CREATE TABLE Users (
    UserID CHAR(36) PRIMARY KEY,
    UserName VARCHAR(255) NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE,
    Role VARCHAR(50) NOT NULL,
    Password VARCHAR(255) NOT NULL
);
DESC Users;

CREATE TABLE Location (
    LocationID CHAR(36) PRIMARY KEY,
    City VARCHAR(255) NOT NULL,
    State VARCHAR(255) NOT NULL,
    Bbox POLYGON NOT NULL SRID 4326
);

DESC Location;

CREATE TABLE Road_Type (
    TypeID CHAR(36) PRIMARY KEY,
    Type_Name VARCHAR(100) NOT NULL
);
DESC Road_Type;

CREATE TABLE Road (
    RoadID CHAR(36) PRIMARY KEY,
    OsmID BIGINT UNIQUE,
    Name VARCHAR(255),
    Geometry LINESTRING NOT NULL SRID 4326,
    LocationID CHAR(36) NOT NULL,
    TypeID CHAR(36) NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID),
    FOREIGN KEY (TypeID) REFERENCES Road_Type(TypeID)
);

DESC Road;

CREATE TABLE Condition_Category (
    CategoryID CHAR(36) PRIMARY KEY,
    Category_Name VARCHAR(100) NOT NULL
);

DESC Condition_Category;

CREATE TABLE Road_Condition (
    RoadID CHAR(36) PRIMARY KEY,
    CategoryID CHAR(36) NOT NULL,
    Condition_Score FLOAT NOT NULL,
    Source VARCHAR(100),
    Last_Updated TIMESTAMP NOT NULL,
    FOREIGN KEY (RoadID) REFERENCES Road(RoadID),
    FOREIGN KEY (CategoryID) REFERENCES Condition_Category(CategoryID)
);

DESC Road_Condition;

CREATE TABLE CNN_Model (
    ModelID CHAR(36) PRIMARY KEY,
    Model_Name VARCHAR(255) NOT NULL,
    Version VARCHAR(50) NOT NULL,
    Accuracy FLOAT
);

DESC CNN_Model;

CREATE TABLE Condition_Report (
    ReportID CHAR(36) PRIMARY KEY,
    RoadID CHAR(36) NOT NULL,
    UserID CHAR(36),
    ModelID CHAR(36),
    Predicted_Condition VARCHAR(100) NOT NULL,
    Confidence_Score FLOAT,
    Reported_At TIMESTAMP NOT NULL,
    FOREIGN KEY (RoadID) REFERENCES Road(RoadID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (ModelID) REFERENCES CNN_Model(ModelID)
);

DESC Condition_Report;

CREATE TABLE Road_Image (
    ImageID CHAR(36) PRIMARY KEY,
    RoadID CHAR(36) NOT NULL,
    Image_Path VARCHAR(500) NOT NULL,
    Captured_At TIMESTAMP,
    FOREIGN KEY (RoadID) REFERENCES Road(RoadID)
);

DESC Road_Image;

CREATE TABLE Admin_Action (
    ActionID CHAR(36) PRIMARY KEY,
    UserID CHAR(36) NOT NULL,
    RoadID CHAR(36) NOT NULL,
    Action_Type VARCHAR(100) NOT NULL,
    Action_Time TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoadID) REFERENCES Road(RoadID)
);

DESC Admin_Action;


/* DML COMMANDS */
-- Users 
INSERT INTO Users VALUES
('u1', 'Alice', 'alice@gmail.com', 'USER', 'pass123'),
('u2', 'Bob', 'bob@gmail.com', 'ADMIN', 'pass456');
SELECT * FROM Users;

-- Location Values
INSERT INTO Location VALUES
('l1', 'Mumbai', 'Maharashtra', ST_GeomFromText('POLYGON((72.8 19.0, 72.9 19.0, 72.9 19.1, 72.8 19.1, 72.8 19.0))', 4326));
SELECT * FROM Location;

INSERT INTO Location VALUES
('l2', 'Delhi', 'Delhi', ST_GeomFromText('POLYGON((77.1 28.5, 77.3 28.5, 77.3 28.7, 77.1 28.7, 77.1 28.5))', 4326)),

('l3', 'Bangalore', 'Karnataka', ST_GeomFromText('POLYGON((77.5 12.9, 77.7 12.9, 77.7 13.1, 77.5 13.1, 77.5 12.9))', 4326)),

('l4', 'Chennai', 'Tamil Nadu', ST_GeomFromText('POLYGON((80.2 13.0, 80.3 13.0, 80.3 13.1, 80.2 13.1, 80.2 13.0))', 4326)),

('l5', 'Hyderabad', 'Telangana', ST_GeomFromText('POLYGON((78.3 17.3, 78.5 17.3, 78.5 17.5, 78.3 17.5, 78.3 17.3))', 4326)),

('l6', 'Kolkata', 'West Bengal', ST_GeomFromText('POLYGON((88.3 22.5, 88.5 22.5, 88.5 22.7, 88.3 22.7, 88.3 22.5))', 4326)),

('l7', 'Pune', 'Maharashtra', ST_GeomFromText('POLYGON((73.8 18.4, 74.0 18.4, 74.0 18.6, 73.8 18.6, 73.8 18.4))', 4326)),

('l8', 'Ahmedabad', 'Gujarat', ST_GeomFromText('POLYGON((72.5 23.0, 72.7 23.0, 72.7 23.2, 72.5 23.2, 72.5 23.0))', 4326)),

('l9', 'Jaipur', 'Rajasthan', ST_GeomFromText('POLYGON((75.7 26.8, 75.9 26.8, 75.9 27.0, 75.7 27.0, 75.7 26.8))', 4326)),

('l10', 'Lucknow', 'Uttar Pradesh', ST_GeomFromText('POLYGON((80.9 26.8, 81.1 26.8, 81.1 27.0, 80.9 27.0, 80.9 26.8))', 4326)),

('l11', 'Chandigarh', 'Punjab', ST_GeomFromText('POLYGON((76.7 30.7, 76.9 30.7, 76.9 30.9, 76.7 30.9, 76.7 30.7))', 4326));

Select * from Location;

-- Road Types
INSERT INTO Road_Type VALUES
('t1', 'Highway'),
('t2', 'Street');

-- (in case)
-- DELETE FROM Road
-- WHERE RoadID IN ('r11','r12','r13','r14','r15','r16','r17','r18','r19','r20');

-- Road Values
INSERT INTO Road VALUES
-- Mumbai(l1)
('r1', 123456, 'Main Road',
 ST_GeomFromText('LINESTRING(72.85 19.05, 72.86 19.06)', 4326),
 'l1', 't1');
 
 INSERT INTO Road VALUES
-- Delhi (l2)
('r11', 200001, 'Connaught Place Road',
 ST_GeomFromText('LINESTRING(77.20 28.63, 77.21 28.64)', 4326),
 'l2', 't1'),

-- Bangalore (l3)
('r12', 200002, 'MG Road Bangalore',
 ST_GeomFromText('LINESTRING(77.60 12.97, 77.61 12.98)', 4326),
 'l3', 't2'),

-- Chennai (l4)
('r13', 200003, 'OMR Road',
 ST_GeomFromText('LINESTRING(80.25 13.05, 80.26 13.06)', 4326),
 'l4', 't1'),

-- Hyderabad (l5)
('r14', 200004, 'Banjara Hills Road',
 ST_GeomFromText('LINESTRING(78.40 17.42, 78.41 17.43)', 4326),
 'l5', 't2'),

-- Kolkata (l6)
('r15', 200005, 'Park Street',
 ST_GeomFromText('LINESTRING(88.36 22.56, 88.37 22.57)', 4326),
 'l6', 't1'),

-- Pune (l7)
('r16', 200006, 'FC Road',
 ST_GeomFromText('LINESTRING(73.85 18.52, 73.86 18.53)', 4326),
 'l7', 't2'),

-- Ahmedabad (l8)
('r17', 200007, 'SG Highway',
 ST_GeomFromText('LINESTRING(72.55 23.03, 72.56 23.04)', 4326),
 'l8', 't1'),

-- Jaipur (l9)
('r18', 200008, 'MI Road',
 ST_GeomFromText('LINESTRING(75.80 26.90, 75.81 26.91)', 4326),
 'l9', 't2'),

-- Lucknow (l10)
('r19', 200009, 'Hazratganj Road',
 ST_GeomFromText('LINESTRING(80.95 26.85, 80.96 26.86)', 4326),
 'l10', 't1'),

-- Chandigarh (l11)
('r20', 200010, 'Sector 17 Road',
 ST_GeomFromText('LINESTRING(76.78 30.74, 76.79 30.75)', 4326),
 'l11', 't2');
  
 select * from road;

 
-- Condition Category Values 
 INSERT INTO Condition_Category VALUES
('c1', 'Good'),
('c2', 'Moderate'),
('c3', 'Poor');


-- Road Condition Values

INSERT INTO Road_Condition VALUES
('r1', 'c2', 65.5, 'AI_Model', NOW());
INSERT INTO Road_Condition VALUES
('r2','c1',85.0,'Sensor',NOW()),
('r3','c3',40.2,'User',NOW()),
('r4','c2',60.0,'AI',NOW()),
('r5','c1',90.0,'Sensor',NOW()),
('r6','c3',35.0,'User',NOW()),
('r7','c2',70.0,'AI',NOW()),
('r8','c1',88.0,'Sensor',NOW()),
('r9','c2',68.0,'AI',NOW()),
('r10','c3',30.0,'User',NOW()),
('r11','c2',66.0,'AI',NOW());

select * from Road_Condition;

INSERT INTO CNN_Model VALUES
('m1', 'RoadNet', 'v1.0', 0.92);
INSERT INTO CNN_Model VALUES
('m2','RoadNet','v2.0',0.94),
('m3','DeepRoad','v1.0',0.91),
('m4','SmartDetect','v3.1',0.96);

select * from cnn_model;

-- Condition Report
INSERT INTO Condition_Report VALUES
('rep1', 'r1', 'u1', 'm1', 'Moderate', 0.87, NOW());
INSERT INTO Condition_Report VALUES
('rep2','r2','u1','m2','Good',0.92,NOW()),
('rep3','r3','u2','m3','Poor',0.85,NOW()),
('rep4','r4','u1','m1','Moderate',0.88,NOW()),
('rep5','r5','u2','m2','Good',0.93,NOW()),
('rep6','r6','u1','m3','Poor',0.80,NOW()),
('rep7','r7','u2','m4','Moderate',0.90,NOW()),
('rep8','r8','u1','m2','Good',0.95,NOW()),
('rep9','r9','u2','m1','Moderate',0.87,NOW()),
('rep10','r10','u1','m3','Poor',0.82,NOW()),
('rep11','r11','u2','m4','Moderate',0.91,NOW());

select * from Condition_report;

-- Road Images
INSERT INTO Road_Image VALUES
('img1', 'r1', '/images/road1.jpg', NOW());
INSERT INTO Road_Image VALUES
('img2','r2','/images/r2.jpg',NOW()),
('img3','r3','/images/r3.jpg',NOW()),
('img4','r4','/images/r4.jpg',NOW()),
('img5','r5','/images/r5.jpg',NOW()),
('img6','r6','/images/r6.jpg',NOW()),
('img7','r7','/images/r7.jpg',NOW()),
('img8','r8','/images/r8.jpg',NOW()),
('img9','r9','/images/r9.jpg',NOW()),
('img10','r10','/images/r10.jpg',NOW()),
('img11','r11','/images/r11.jpg',NOW()),
('img12','r12','/images/r12.jpg',NOW());

select * from Road_image;

-- Admin Action
INSERT INTO Admin_Action VALUES
('a1', 'u2', 'r1', 'Marked for Repair', NOW());
INSERT INTO Admin_Action VALUES
('a2','u2','r2','Inspection Scheduled',NOW()),
('a3','u2','r3','Repair Initiated',NOW()),
('a4','u2','r4','Marked Safe',NOW()),
('a5','u2','r5','Maintenance Completed',NOW()),
('a6','u2','r6','Inspection Scheduled',NOW()),
('a7','u2','r7','Repair Initiated',NOW()),
('a8','u2','r8','Marked Safe',NOW()),
('a9','u2','r9','Maintenance Completed',NOW()),
('a10','u2','r10','Inspection Scheduled',NOW()),
('a11','u2','r11','Repair Initiated',NOW()),
('a12','u2','r12','Marked Safe',NOW());

select * from Admin_action;

UPDATE Road SET LocationID = 'l2' WHERE RoadID = 'r2';
UPDATE Road SET LocationID = 'l3' WHERE RoadID = 'r3';
UPDATE Road SET LocationID = 'l4' WHERE RoadID = 'r4';
UPDATE Road SET LocationID = 'l5' WHERE RoadID = 'r5';
UPDATE Road SET LocationID = 'l6' WHERE RoadID = 'r6';
UPDATE Road SET LocationID = 'l7' WHERE RoadID = 'r7';
UPDATE Road SET LocationID = 'l8' WHERE RoadID = 'r8';
UPDATE Road SET LocationID = 'l9' WHERE RoadID = 'r9';
UPDATE Road SET LocationID = 'l10' WHERE RoadID = 'r10';
UPDATE Road SET LocationID = 'l11' WHERE RoadID = 'r11';

/* basic select queries */

SELECT r.Name, l.City, l.State
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID;

SELECT r.Name, cc.Category_Name, rc.Condition_Score
FROM Road r
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
JOIN Condition_Category cc ON rc.CategoryID = cc.CategoryID;

SELECT cr.ReportID, u.UserName, cm.Model_Name, cr.Predicted_Condition
FROM Condition_Report cr
LEFT JOIN Users u ON cr.UserID = u.UserID
LEFT JOIN CNN_Model cm ON cr.ModelID = cm.ModelID;

SELECT r.Name, ri.Image_Path
FROM Road r
JOIN Road_Image ri ON r.RoadID = ri.RoadID;

SELECT u.UserName, a.Action_Type, a.Action_Time
FROM Admin_Action a
JOIN Users u ON a.UserID = u.UserID;

-- CHAPTER 3

-- CONSTRAINTS
-- Q1
ALTER TABLE Road_Condition
ADD CONSTRAINT chk_score CHECK (Condition_Score BETWEEN 0 AND 100);
select * from Road_Condition;

-- Q2
ALTER TABLE Road_Type
ADD CONSTRAINT unique_type_name UNIQUE (Type_Name);

Select * from Road_Type;

-- Q3
ALTER TABLE Users
ADD CONSTRAINT chk_role
CHECK (Role IN ('USER','ADMIN'));

Select * from Users;

-- Aggregate functions

-- Q1
SELECT l.City, AVG(rc.Condition_Score) AS Avg_Score
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
GROUP BY l.City;

-- Q2
SELECT l.State, COUNT(r.RoadID) AS Total_Roads
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID
GROUP BY l.State;

-- Q3
SELECT cc.Category_Name,
       MAX(rc.Condition_Score) AS Max_Score,
       MIN(rc.Condition_Score) AS Min_Score
FROM Road_Condition rc
JOIN Condition_Category cc ON rc.CategoryID = cc.CategoryID
GROUP BY cc.Category_Name;


-- SET Operations

-- Q1
SELECT RoadID FROM Road_Condition
UNION
SELECT RoadID FROM Condition_Report;

-- Q2
SELECT cc.Category_Name,
       MAX(rc.Condition_Score) AS Max_Score,
       MIN(rc.Condition_Score) AS Min_Score
FROM Road_Condition rc
JOIN Condition_Category cc ON rc.CategoryID = cc.CategoryID
GROUP BY cc.Category_Name;

-- Q3
SELECT RoadID FROM Condition_Report
WHERE RoadID NOT IN (
    SELECT RoadID FROM Road_Image
);

-- Subqueries

-- Q1
SELECT r.Name, rc.Condition_Score
FROM Road r
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
WHERE rc.Condition_Score < (
    SELECT AVG(Condition_Score) FROM Road_Condition
);

-- Q2
SELECT r.Name, rc.Condition_Score
FROM Road r
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
WHERE rc.Condition_Score = (
    SELECT MAX(Condition_Score) FROM Road_Condition
);

-- Q3
SELECT l.City
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
GROUP BY l.City
HAVING AVG(rc.Condition_Score) >
(
    SELECT AVG(Condition_Score) FROM Road_Condition
);

-- Joins

-- Q1
SELECT r.Name, l.City, cc.Category_Name, rc.Condition_Score
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID
JOIN Road_Condition rc ON r.RoadID = rc.RoadID
JOIN Condition_Category cc ON rc.CategoryID = cc.CategoryID;

-- Q2
SELECT r.Name, ri.Image_Path, rc.Condition_Score
FROM Road r
LEFT JOIN Road_Image ri ON r.RoadID = ri.RoadID
LEFT JOIN Road_Condition rc ON r.RoadID = rc.RoadID;

-- Q3
SELECT u.UserName, r.Name, cr.Predicted_Condition
FROM Condition_Report cr
JOIN Users u ON cr.UserID = u.UserID
JOIN Road r ON cr.RoadID = r.RoadID;

-- Views
CREATE VIEW Road_Summary AS
SELECT r.Name, l.City, rc.Condition_Score
FROM Road r
JOIN Location l ON r.LocationID = l.LocationID
JOIN Road_Condition rc ON r.RoadID = rc.RoadID;

Select * from Road_Summary;

-- Triggers
DELIMITER $$

CREATE TRIGGER update_timestamp
BEFORE UPDATE ON Road_Condition
FOR EACH ROW
BEGIN
   SET NEW.Last_Updated = NOW();
END$$

DELIMITER ;

Select * from update_timestamp;
-- Cursors
DELIMITER $$
CREATE PROCEDURE GetLowConditionRoads()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE rname VARCHAR(255);
    
    DECLARE cur CURSOR FOR
    SELECT r.Name
    FROM Road r
    JOIN Road_Condition rc ON r.RoadID = rc.RoadID
    WHERE rc.Condition_Score < 50;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO rname;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT rname;
    END LOOP;

    CLOSE cur;
END$$
DELIMITER ;

CALL GetLowConditionRoads();

