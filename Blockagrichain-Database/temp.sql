-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: arigatouairlines
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `aircraft`
--

DROP TABLE IF EXISTS `aircraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircraft` (
  `aircraft_id` int NOT NULL AUTO_INCREMENT,
  `airline_id` int NOT NULL,
  `aircraft_type_id` int NOT NULL,
  `registration_number` varchar(20) NOT NULL,
  `status` enum('Active','Maintenance','Retired') DEFAULT 'Active',
  PRIMARY KEY (`aircraft_id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `airline_id` (`airline_id`),
  KEY `aircraft_type_id` (`aircraft_type_id`),
  CONSTRAINT `aircraft_ibfk_1` FOREIGN KEY (`airline_id`) REFERENCES `airline` (`airline_id`),
  CONSTRAINT `aircraft_ibfk_2` FOREIGN KEY (`aircraft_type_id`) REFERENCES `aircraft_type` (`aircraft_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aircraft`
--

LOCK TABLES `aircraft` WRITE;
/*!40000 ALTER TABLE `aircraft` DISABLE KEYS */;
INSERT INTO `aircraft` VALUES (6,10,2,'1997','Active'),(9,4,3,'1941','Active'),(10,2,8,'765','Active'),(11,3,8,'vn2005','Active');
/*!40000 ALTER TABLE `aircraft` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aircraft_type`
--

DROP TABLE IF EXISTS `aircraft_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircraft_type` (
  `aircraft_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(100) NOT NULL,
  `total_seats` int NOT NULL,
  `num_cols` int NOT NULL DEFAULT '6',
  PRIMARY KEY (`aircraft_type_id`),
  CONSTRAINT `aircraft_type_chk_1` CHECK ((`total_seats` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aircraft_type`
--

LOCK TABLES `aircraft_type` WRITE;
/*!40000 ALTER TABLE `aircraft_type` DISABLE KEYS */;
INSERT INTO `aircraft_type` VALUES (2,'Airbus 340',300,6),(3,'Boing 787',240,8),(6,'Boing 2005',240,6),(8,'Boing 5000',240,6);
/*!40000 ALTER TABLE `aircraft_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `airline`
--

DROP TABLE IF EXISTS `airline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airline` (
  `airline_id` int NOT NULL AUTO_INCREMENT,
  `airline_code` varchar(10) NOT NULL,
  `airline_name` varchar(100) NOT NULL,
  `country` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`airline_id`),
  UNIQUE KEY `airline_code` (`airline_code`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airline`
--

LOCK TABLES `airline` WRITE;
/*!40000 ALTER TABLE `airline` DISABLE KEYS */;
INSERT INTO `airline` VALUES (2,'VJ1','Vietjet','Viet Nam',0),(3,'VJ2','Vietjet','Viet Nam',0),(4,'VJ142','Vietjet','Viet Nam',0),(5,'VJ1421','Vietjet','Viet Nam',0),(8,'Ty','Vietjet','Viet Nam',0),(10,'Ter','Vietjet','Viet Nam',0),(38,'VN','Vietnam Airlines','Việt Nam',1),(39,'BB','BamBoo','Việt Nam',1),(40,'VT','VietTravel','Việt Nam',1);
/*!40000 ALTER TABLE `airline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `airport`
--

DROP TABLE IF EXISTS `airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airport` (
  `airport_id` int NOT NULL AUTO_INCREMENT,
  `airport_code` varchar(10) NOT NULL,
  `airport_name` varchar(100) NOT NULL,
  `city` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  PRIMARY KEY (`airport_id`),
  UNIQUE KEY `airport_code` (`airport_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airport`
--

LOCK TABLES `airport` WRITE;
/*!40000 ALTER TABLE `airport` DISABLE KEYS */;
INSERT INTO `airport` VALUES (5,'HN4','MY DINH','HA NOI YEU','VIET NAM'),(6,'HN5','MY DINH','HA NOI YEU','VIET NAM'),(7,'HN10','MY DINH','HA NOI YEU','VIET NAM'),(11,'NB1','Nội Bài','Hà Nội','Việt Nam'),(12,'HAN','Nội Bài','Hà Nội','Việt Nam'),(13,'SGN','TSN','TPHCM','VN'),(14,'TH','Sao Vàng','Thanh Hóa','VN');
/*!40000 ALTER TABLE `airport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ancillary_service`
--

DROP TABLE IF EXISTS `ancillary_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ancillary_service` (
  `service_id` int NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ancillary_service`
--

LOCK TABLES `ancillary_service` WRITE;
/*!40000 ALTER TABLE `ancillary_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `ancillary_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` varchar(100) DEFAULT NULL,
  `old_value` json DEFAULT NULL,
  `new_value` json DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `booking_code` varchar(255) DEFAULT NULL,
  `booking_status` varchar(20) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_deadline` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_booking_user` (`user_id`,`created_at`),
  CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES (3,616,'873871a2-cd98-493a-89a0-013ba9dbab17','0','0',1000000.00,NULL,'2025-12-29 21:45:27'),(4,616,'0f29034b-f36e-40c5-a6fa-bbc4909ddb83','Pending','Pending',2500000.00,NULL,'2025-12-29 22:58:46'),(6,616,'eb9dd581-cdf2-4da2-885e-d0390d596644','Pending','Pending',2500000.00,NULL,'2025-12-29 23:00:56'),(8,616,'55513649-bc1d-4a92-a266-4cfda6c608df','Pending','Pending',2500000.00,NULL,'2025-12-29 23:01:52'),(9,616,'709fa782-2fa5-4763-8645-3c552a0b8e3f','Pending','Pending',2000000.00,NULL,'2025-12-29 23:02:31'),(10,616,'11afa2ba-7a17-42f8-80d7-9bbaca92f6ac','Confirmed','Paid',1000000.00,NULL,'2025-12-29 23:08:40'),(11,616,'b5b59d9a-ff78-488a-bf8d-e35562ceee2d','Confirmed','Paid',1000000.00,NULL,'2025-12-29 23:15:15'),(12,616,'9fe3d764-3c55-428f-9994-796e4bf0ba01','Confirmed','Paid',2000000.00,NULL,'2025-12-29 23:58:18'),(13,616,'eda01f6c-e5b6-4215-94af-477f1d711460','0','0',1000000.00,NULL,'2025-12-30 00:35:41'),(14,616,'10cb22ef-8617-435c-8f5d-1a46ca8694f0','1','1',2000000.00,NULL,'2025-12-30 01:56:42'),(15,616,'0deb04f3-b6e8-42b0-b504-c9050748fef1','1','1',9000.00,NULL,'2025-12-30 01:58:55');
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_service`
--

DROP TABLE IF EXISTS `booking_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_service` (
  `booking_service_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  `service_id` int NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_service_id`),
  UNIQUE KEY `ticket_id` (`ticket_id`,`service_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `booking_service_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`ticket_id`),
  CONSTRAINT `booking_service_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `ancillary_service` (`service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_service`
--

LOCK TABLES `booking_service` WRITE;
/*!40000 ALTER TABLE `booking_service` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight`
--

DROP TABLE IF EXISTS `flight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight` (
  `flight_id` int NOT NULL AUTO_INCREMENT,
  `schedule_id` int NOT NULL,
  `aircraft_id` int DEFAULT NULL,
  `flight_date` date NOT NULL,
  `departure_datetime` datetime NOT NULL,
  `arrival_datetime` datetime NOT NULL,
  `status` enum('Scheduled','On Time','Delayed','Cancelled','Departed','Arrived') DEFAULT 'Scheduled',
  PRIMARY KEY (`flight_id`),
  UNIQUE KEY `schedule_id` (`schedule_id`,`flight_date`),
  KEY `aircraft_id` (`aircraft_id`),
  KEY `idx_flight_search` (`flight_date`,`status`),
  CONSTRAINT `flight_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `flight_schedule` (`schedule_id`),
  CONSTRAINT `flight_ibfk_2` FOREIGN KEY (`aircraft_id`) REFERENCES `aircraft` (`aircraft_id`),
  CONSTRAINT `flight_chk_1` CHECK ((`arrival_datetime` > `departure_datetime`))
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight`
--

LOCK TABLES `flight` WRITE;
/*!40000 ALTER TABLE `flight` DISABLE KEYS */;
INSERT INTO `flight` VALUES (34,35,10,'2026-01-10','2026-01-10 03:52:00','2026-01-10 05:53:00','Scheduled'),(37,38,11,'2026-01-02','2026-01-02 17:58:00','2026-01-02 19:59:00','Scheduled'),(42,43,11,'2026-01-08','2026-01-08 07:08:00','2026-01-08 08:09:00','Scheduled'),(43,44,11,'2026-01-08','2026-01-08 05:36:00','2026-01-08 06:36:00','Scheduled'),(44,45,10,'2026-01-03','2026-01-03 09:40:00','2026-01-03 10:40:00','Scheduled'),(45,46,6,'2026-01-05','2026-01-05 05:43:00','2026-01-05 07:43:00','Scheduled');
/*!40000 ALTER TABLE `flight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_price`
--

DROP TABLE IF EXISTS `flight_price`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_price` (
  `price_id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `class_id` int NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT '0.00',
  `total_seats` int NOT NULL,
  `available_seats` int NOT NULL,
  PRIMARY KEY (`price_id`),
  UNIQUE KEY `flight_id` (`flight_id`,`class_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `flight_price_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE,
  CONSTRAINT `flight_price_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `ticket_class` (`class_id`),
  CONSTRAINT `flight_price_chk_1` CHECK ((`base_price` >= 0)),
  CONSTRAINT `flight_price_chk_2` CHECK ((`tax` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_price`
--

LOCK TABLES `flight_price` WRITE;
/*!40000 ALTER TABLE `flight_price` DISABLE KEYS */;
INSERT INTO `flight_price` VALUES (26,34,1,1000000.00,0.00,84,84),(27,34,2,2000000.00,0.00,78,78),(28,34,3,1500000.00,0.00,78,78),(35,37,1,2500000.00,0.00,84,84),(36,37,2,5000000.00,0.00,78,78),(37,37,3,3750000.00,0.00,78,78),(41,42,1,2000000.00,0.00,84,84),(42,42,2,4000000.00,0.00,78,78),(43,42,3,3000000.00,0.00,78,78),(44,43,1,2000000.00,0.00,84,84),(45,43,2,4000000.00,0.00,78,78),(46,43,3,3000000.00,0.00,78,78),(47,44,1,1250000.00,0.00,84,84),(48,44,2,2500000.00,0.00,78,78),(49,44,3,1875000.00,0.00,78,78),(50,45,1,9000.00,0.00,4,4),(51,45,2,18000.00,0.00,0,0),(52,45,3,13500.00,0.00,0,0);
/*!40000 ALTER TABLE `flight_price` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_schedule`
--

DROP TABLE IF EXISTS `flight_schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_schedule` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `flight_number` varchar(20) NOT NULL,
  `airline_id` int NOT NULL,
  `departure_airport_id` int NOT NULL,
  `arrival_airport_id` int NOT NULL,
  `departure_time` time NOT NULL,
  `arrival_time` time NOT NULL,
  `duration_minutes` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`schedule_id`),
  UNIQUE KEY `flight_number` (`flight_number`,`departure_airport_id`,`arrival_airport_id`),
  KEY `airline_id` (`airline_id`),
  KEY `arrival_airport_id` (`arrival_airport_id`),
  KEY `idx_schedule_search` (`departure_airport_id`,`arrival_airport_id`,`is_active`),
  CONSTRAINT `flight_schedule_ibfk_1` FOREIGN KEY (`airline_id`) REFERENCES `airline` (`airline_id`),
  CONSTRAINT `flight_schedule_ibfk_2` FOREIGN KEY (`departure_airport_id`) REFERENCES `airport` (`airport_id`),
  CONSTRAINT `flight_schedule_ibfk_3` FOREIGN KEY (`arrival_airport_id`) REFERENCES `airport` (`airport_id`),
  CONSTRAINT `flight_schedule_chk_1` CHECK ((`departure_airport_id` <> `arrival_airport_id`))
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_schedule`
--

LOCK TABLES `flight_schedule` WRITE;
/*!40000 ALTER TABLE `flight_schedule` DISABLE KEYS */;
INSERT INTO `flight_schedule` VALUES (1,'8080',8,5,7,'15:20:00','17:50:00',150,0),(3,'03668',8,6,7,'19:20:00','17:50:00',150,1),(5,'765432',8,5,7,'15:20:00','17:50:00',150,1),(6,'2005',8,5,7,'15:20:00','17:50:00',150,1),(7,'999',8,5,7,'15:20:00','17:50:00',150,1),(9,'9982',8,5,7,'15:20:00','17:50:00',150,1),(11,'8887213',8,5,7,'15:20:00','17:50:00',150,1),(12,'03668',8,5,7,'15:20:00','17:50:00',150,1),(15,'VN123456',2,5,6,'16:09:00','17:09:00',60,1),(16,'vn111',3,11,5,'16:12:00','17:13:00',61,1),(17,'vn123',5,5,7,'06:09:00','09:10:00',181,1),(20,'vn123',3,11,7,'08:17:00','09:18:00',61,1),(21,' vn123',3,7,6,'07:21:00','08:22:00',61,1),(22,'vn112233',4,7,5,'09:09:00','10:10:00',61,1),(24,'vn234',4,7,5,'09:09:00','10:10:00',61,1),(30,'vn2005',3,7,5,'09:25:00','10:26:00',61,1),(31,'vn1122',3,6,11,'20:57:00','23:00:00',123,1),(32,'vn1999',3,6,12,'06:31:00','08:32:00',121,1),(33,'VN123',2,12,5,'05:36:00','07:35:00',119,1),(34,'vn1234',3,6,12,'03:37:00','05:38:00',121,1),(35,'vn2005',3,6,5,'03:52:00','05:53:00',121,1),(36,'vn999',4,7,5,'17:56:00','18:58:00',62,1),(37,'vn345',40,12,6,'18:06:00','07:08:00',658,1),(38,'vn8899',3,14,12,'17:58:00','19:59:00',121,1),(41,'vn2025',4,13,14,'05:13:00','06:13:00',60,1),(43,'vn1999',2,13,12,'07:08:00','08:09:00',61,1),(44,'mh370',3,11,14,'05:36:00','06:36:00',60,1),(45,'vn370',4,13,14,'09:40:00','10:40:00',60,1),(46,'nm1',2,13,14,'05:43:00','07:43:00',120,1);
/*!40000 ALTER TABLE `flight_schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flight_seat`
--

DROP TABLE IF EXISTS `flight_seat`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_seat` (
  `flight_seat_id` int NOT NULL AUTO_INCREMENT,
  `flight_id` int NOT NULL,
  `seat_map_id` int NOT NULL,
  `status` enum('Available','Booked','Locked') DEFAULT 'Available',
  PRIMARY KEY (`flight_seat_id`),
  UNIQUE KEY `flight_id` (`flight_id`,`seat_map_id`),
  KEY `seat_map_id` (`seat_map_id`),
  CONSTRAINT `flight_seat_ibfk_1` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`) ON DELETE CASCADE,
  CONSTRAINT `flight_seat_ibfk_2` FOREIGN KEY (`seat_map_id`) REFERENCES `seat_map` (`seat_map_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2713 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flight_seat`
--

LOCK TABLES `flight_seat` WRITE;
/*!40000 ALTER TABLE `flight_seat` DISABLE KEYS */;
INSERT INTO `flight_seat` VALUES (781,34,488,'Available'),(782,34,489,'Available'),(783,34,490,'Available'),(784,34,491,'Available'),(785,34,492,'Available'),(786,34,493,'Available'),(787,34,494,'Available'),(788,34,495,'Available'),(789,34,496,'Available'),(790,34,497,'Available'),(791,34,498,'Available'),(792,34,499,'Available'),(793,34,500,'Available'),(794,34,501,'Available'),(795,34,502,'Available'),(796,34,503,'Available'),(797,34,504,'Available'),(798,34,505,'Available'),(799,34,506,'Available'),(800,34,507,'Available'),(801,34,508,'Available'),(802,34,509,'Available'),(803,34,510,'Available'),(804,34,511,'Available'),(805,34,512,'Available'),(806,34,513,'Available'),(807,34,514,'Available'),(808,34,515,'Available'),(809,34,516,'Available'),(810,34,517,'Available'),(811,34,518,'Available'),(812,34,519,'Available'),(813,34,520,'Available'),(814,34,521,'Available'),(815,34,522,'Available'),(816,34,523,'Available'),(817,34,524,'Available'),(818,34,525,'Available'),(819,34,526,'Available'),(820,34,527,'Available'),(821,34,528,'Available'),(822,34,529,'Available'),(823,34,530,'Available'),(824,34,531,'Available'),(825,34,532,'Available'),(826,34,533,'Available'),(827,34,534,'Available'),(828,34,535,'Available'),(829,34,536,'Available'),(830,34,537,'Available'),(831,34,538,'Available'),(832,34,539,'Available'),(833,34,540,'Available'),(834,34,541,'Available'),(835,34,542,'Available'),(836,34,543,'Available'),(837,34,544,'Available'),(838,34,545,'Available'),(839,34,546,'Available'),(840,34,547,'Available'),(841,34,548,'Available'),(842,34,549,'Available'),(843,34,550,'Available'),(844,34,551,'Available'),(845,34,552,'Available'),(846,34,553,'Available'),(847,34,554,'Available'),(848,34,555,'Available'),(849,34,556,'Available'),(850,34,557,'Available'),(851,34,558,'Available'),(852,34,559,'Available'),(853,34,560,'Available'),(854,34,561,'Available'),(855,34,562,'Available'),(856,34,563,'Available'),(857,34,564,'Available'),(858,34,565,'Available'),(859,34,566,'Available'),(860,34,567,'Available'),(861,34,568,'Available'),(862,34,569,'Available'),(863,34,570,'Available'),(864,34,571,'Available'),(865,34,572,'Available'),(866,34,573,'Available'),(867,34,574,'Available'),(868,34,575,'Available'),(869,34,576,'Available'),(870,34,577,'Available'),(871,34,578,'Available'),(872,34,579,'Available'),(873,34,580,'Available'),(874,34,581,'Available'),(875,34,582,'Available'),(876,34,583,'Available'),(877,34,584,'Available'),(878,34,585,'Available'),(879,34,586,'Available'),(880,34,587,'Available'),(881,34,588,'Available'),(882,34,589,'Available'),(883,34,590,'Available'),(884,34,591,'Available'),(885,34,592,'Available'),(886,34,593,'Available'),(887,34,594,'Available'),(888,34,595,'Available'),(889,34,596,'Available'),(890,34,597,'Available'),(891,34,598,'Available'),(892,34,599,'Available'),(893,34,600,'Available'),(894,34,601,'Available'),(895,34,602,'Available'),(896,34,603,'Available'),(897,34,604,'Available'),(898,34,605,'Available'),(899,34,606,'Available'),(900,34,607,'Available'),(901,34,608,'Available'),(902,34,609,'Available'),(903,34,610,'Available'),(904,34,611,'Available'),(905,34,612,'Available'),(906,34,613,'Available'),(907,34,614,'Available'),(908,34,615,'Available'),(909,34,616,'Available'),(910,34,617,'Available'),(911,34,618,'Available'),(912,34,619,'Available'),(913,34,620,'Available'),(914,34,621,'Available'),(915,34,622,'Available'),(916,34,623,'Available'),(917,34,624,'Available'),(918,34,625,'Available'),(919,34,626,'Available'),(920,34,627,'Available'),(921,34,628,'Available'),(922,34,629,'Available'),(923,34,630,'Available'),(924,34,631,'Available'),(925,34,632,'Available'),(926,34,633,'Available'),(927,34,634,'Available'),(928,34,635,'Available'),(929,34,636,'Available'),(930,34,637,'Available'),(931,34,638,'Available'),(932,34,639,'Available'),(933,34,640,'Available'),(934,34,641,'Available'),(935,34,642,'Available'),(936,34,643,'Available'),(937,34,644,'Booked'),(938,34,645,'Booked'),(939,34,646,'Booked'),(940,34,647,'Available'),(941,34,648,'Available'),(942,34,649,'Available'),(943,34,650,'Booked'),(944,34,651,'Available'),(945,34,652,'Available'),(946,34,653,'Available'),(947,34,654,'Available'),(948,34,655,'Available'),(949,34,656,'Available'),(950,34,657,'Available'),(951,34,658,'Available'),(952,34,659,'Available'),(953,34,660,'Available'),(954,34,661,'Available'),(955,34,662,'Available'),(956,34,663,'Available'),(957,34,664,'Available'),(958,34,665,'Available'),(959,34,666,'Available'),(960,34,667,'Available'),(961,34,668,'Available'),(962,34,669,'Available'),(963,34,670,'Available'),(964,34,671,'Available'),(965,34,672,'Available'),(966,34,673,'Available'),(967,34,674,'Available'),(968,34,675,'Available'),(969,34,676,'Available'),(970,34,677,'Available'),(971,34,678,'Available'),(972,34,679,'Available'),(973,34,680,'Available'),(974,34,681,'Available'),(975,34,682,'Available'),(976,34,683,'Available'),(977,34,684,'Available'),(978,34,685,'Available'),(979,34,686,'Available'),(980,34,687,'Available'),(981,34,688,'Available'),(982,34,689,'Available'),(983,34,690,'Available'),(984,34,691,'Available'),(985,34,692,'Available'),(986,34,693,'Available'),(987,34,694,'Available'),(988,34,695,'Available'),(989,34,696,'Available'),(990,34,697,'Available'),(991,34,698,'Available'),(992,34,699,'Available'),(993,34,700,'Available'),(994,34,701,'Available'),(995,34,702,'Available'),(996,34,703,'Available'),(997,34,704,'Available'),(998,34,705,'Available'),(999,34,706,'Available'),(1000,34,707,'Available'),(1001,34,708,'Available'),(1002,34,709,'Available'),(1003,34,710,'Available'),(1004,34,711,'Available'),(1005,34,712,'Available'),(1006,34,713,'Available'),(1007,34,714,'Available'),(1008,34,715,'Available'),(1009,34,716,'Available'),(1010,34,717,'Available'),(1011,34,718,'Available'),(1012,34,719,'Available'),(1013,34,720,'Available'),(1014,34,721,'Available'),(1015,34,722,'Available'),(1016,34,723,'Available'),(1017,34,724,'Available'),(1018,34,725,'Available'),(1019,34,726,'Available'),(1020,34,727,'Available'),(1025,37,488,'Available'),(1026,37,489,'Available'),(1027,37,490,'Available'),(1028,37,491,'Available'),(1029,37,492,'Available'),(1030,37,493,'Available'),(1031,37,494,'Available'),(1032,37,495,'Available'),(1033,37,496,'Available'),(1034,37,497,'Available'),(1035,37,498,'Available'),(1036,37,499,'Available'),(1037,37,500,'Available'),(1038,37,501,'Available'),(1039,37,502,'Available'),(1040,37,503,'Available'),(1041,37,504,'Available'),(1042,37,505,'Available'),(1043,37,506,'Available'),(1044,37,507,'Available'),(1045,37,508,'Available'),(1046,37,509,'Available'),(1047,37,510,'Available'),(1048,37,511,'Available'),(1049,37,512,'Available'),(1050,37,513,'Available'),(1051,37,514,'Available'),(1052,37,515,'Available'),(1053,37,516,'Available'),(1054,37,517,'Available'),(1055,37,518,'Available'),(1056,37,519,'Available'),(1057,37,520,'Available'),(1058,37,521,'Available'),(1059,37,522,'Available'),(1060,37,523,'Available'),(1061,37,524,'Available'),(1062,37,525,'Available'),(1063,37,526,'Available'),(1064,37,527,'Available'),(1065,37,528,'Available'),(1066,37,529,'Available'),(1067,37,530,'Available'),(1068,37,531,'Available'),(1069,37,532,'Available'),(1070,37,533,'Available'),(1071,37,534,'Available'),(1072,37,535,'Available'),(1073,37,536,'Available'),(1074,37,537,'Available'),(1075,37,538,'Available'),(1076,37,539,'Available'),(1077,37,540,'Available'),(1078,37,541,'Available'),(1079,37,542,'Available'),(1080,37,543,'Available'),(1081,37,544,'Available'),(1082,37,545,'Available'),(1083,37,546,'Available'),(1084,37,547,'Available'),(1085,37,548,'Available'),(1086,37,549,'Available'),(1087,37,550,'Available'),(1088,37,551,'Available'),(1089,37,552,'Available'),(1090,37,553,'Available'),(1091,37,554,'Available'),(1092,37,555,'Available'),(1093,37,556,'Available'),(1094,37,557,'Available'),(1095,37,558,'Available'),(1096,37,559,'Available'),(1097,37,560,'Available'),(1098,37,561,'Available'),(1099,37,562,'Available'),(1100,37,563,'Available'),(1101,37,564,'Available'),(1102,37,565,'Available'),(1103,37,566,'Available'),(1104,37,567,'Available'),(1105,37,568,'Available'),(1106,37,569,'Available'),(1107,37,570,'Available'),(1108,37,571,'Available'),(1109,37,572,'Available'),(1110,37,573,'Available'),(1111,37,574,'Available'),(1112,37,575,'Available'),(1113,37,576,'Available'),(1114,37,577,'Available'),(1115,37,578,'Available'),(1116,37,579,'Available'),(1117,37,580,'Available'),(1118,37,581,'Available'),(1119,37,582,'Available'),(1120,37,583,'Available'),(1121,37,584,'Available'),(1122,37,585,'Available'),(1123,37,586,'Available'),(1124,37,587,'Available'),(1125,37,588,'Available'),(1126,37,589,'Available'),(1127,37,590,'Available'),(1128,37,591,'Available'),(1129,37,592,'Available'),(1130,37,593,'Available'),(1131,37,594,'Available'),(1132,37,595,'Available'),(1133,37,596,'Available'),(1134,37,597,'Available'),(1135,37,598,'Available'),(1136,37,599,'Available'),(1137,37,600,'Available'),(1138,37,601,'Available'),(1139,37,602,'Available'),(1140,37,603,'Available'),(1141,37,604,'Available'),(1142,37,605,'Available'),(1143,37,606,'Available'),(1144,37,607,'Available'),(1145,37,608,'Available'),(1146,37,609,'Available'),(1147,37,610,'Available'),(1148,37,611,'Available'),(1149,37,612,'Available'),(1150,37,613,'Available'),(1151,37,614,'Available'),(1152,37,615,'Available'),(1153,37,616,'Available'),(1154,37,617,'Available'),(1155,37,618,'Available'),(1156,37,619,'Available'),(1157,37,620,'Available'),(1158,37,621,'Available'),(1159,37,622,'Available'),(1160,37,623,'Available'),(1161,37,624,'Available'),(1162,37,625,'Available'),(1163,37,626,'Available'),(1164,37,627,'Available'),(1165,37,628,'Available'),(1166,37,629,'Available'),(1167,37,630,'Available'),(1168,37,631,'Available'),(1169,37,632,'Available'),(1170,37,633,'Available'),(1171,37,634,'Available'),(1172,37,635,'Available'),(1173,37,636,'Available'),(1174,37,637,'Available'),(1175,37,638,'Available'),(1176,37,639,'Available'),(1177,37,640,'Available'),(1178,37,641,'Available'),(1179,37,642,'Available'),(1180,37,643,'Available'),(1181,37,644,'Available'),(1182,37,645,'Booked'),(1183,37,646,'Booked'),(1184,37,647,'Available'),(1185,37,648,'Available'),(1186,37,649,'Available'),(1187,37,650,'Booked'),(1188,37,651,'Available'),(1189,37,652,'Available'),(1190,37,653,'Available'),(1191,37,654,'Available'),(1192,37,655,'Available'),(1193,37,656,'Available'),(1194,37,657,'Available'),(1195,37,658,'Available'),(1196,37,659,'Available'),(1197,37,660,'Available'),(1198,37,661,'Available'),(1199,37,662,'Available'),(1200,37,663,'Available'),(1201,37,664,'Available'),(1202,37,665,'Available'),(1203,37,666,'Available'),(1204,37,667,'Available'),(1205,37,668,'Available'),(1206,37,669,'Available'),(1207,37,670,'Available'),(1208,37,671,'Available'),(1209,37,672,'Available'),(1210,37,673,'Available'),(1211,37,674,'Available'),(1212,37,675,'Available'),(1213,37,676,'Available'),(1214,37,677,'Available'),(1215,37,678,'Available'),(1216,37,679,'Available'),(1217,37,680,'Available'),(1218,37,681,'Available'),(1219,37,682,'Available'),(1220,37,683,'Available'),(1221,37,684,'Available'),(1222,37,685,'Available'),(1223,37,686,'Available'),(1224,37,687,'Available'),(1225,37,688,'Available'),(1226,37,689,'Available'),(1227,37,690,'Available'),(1228,37,691,'Available'),(1229,37,692,'Available'),(1230,37,693,'Available'),(1231,37,694,'Available'),(1232,37,695,'Available'),(1233,37,696,'Available'),(1234,37,697,'Available'),(1235,37,698,'Available'),(1236,37,699,'Available'),(1237,37,700,'Available'),(1238,37,701,'Available'),(1239,37,702,'Available'),(1240,37,703,'Available'),(1241,37,704,'Available'),(1242,37,705,'Available'),(1243,37,706,'Available'),(1244,37,707,'Available'),(1245,37,708,'Available'),(1246,37,709,'Available'),(1247,37,710,'Available'),(1248,37,711,'Available'),(1249,37,712,'Available'),(1250,37,713,'Available'),(1251,37,714,'Available'),(1252,37,715,'Available'),(1253,37,716,'Available'),(1254,37,717,'Available'),(1255,37,718,'Available'),(1256,37,719,'Available'),(1257,37,720,'Available'),(1258,37,721,'Available'),(1259,37,722,'Available'),(1260,37,723,'Available'),(1261,37,724,'Available'),(1262,37,725,'Available'),(1263,37,726,'Available'),(1264,37,727,'Available'),(1989,42,488,'Available'),(1990,42,489,'Available'),(1991,42,490,'Available'),(1992,42,491,'Available'),(1993,42,492,'Available'),(1994,42,493,'Available'),(1995,42,494,'Available'),(1996,42,495,'Available'),(1997,42,496,'Available'),(1998,42,497,'Available'),(1999,42,498,'Available'),(2000,42,499,'Available'),(2001,42,500,'Available'),(2002,42,501,'Available'),(2003,42,502,'Available'),(2004,42,503,'Available'),(2005,42,504,'Available'),(2006,42,505,'Available'),(2007,42,506,'Available'),(2008,42,507,'Available'),(2009,42,508,'Available'),(2010,42,509,'Available'),(2011,42,510,'Available'),(2012,42,511,'Available'),(2013,42,512,'Available'),(2014,42,513,'Available'),(2015,42,514,'Available'),(2016,42,515,'Available'),(2017,42,516,'Available'),(2018,42,517,'Available'),(2019,42,518,'Available'),(2020,42,519,'Available'),(2021,42,520,'Available'),(2022,42,521,'Available'),(2023,42,522,'Available'),(2024,42,523,'Available'),(2025,42,524,'Available'),(2026,42,525,'Available'),(2027,42,526,'Available'),(2028,42,527,'Available'),(2029,42,528,'Available'),(2030,42,529,'Available'),(2031,42,530,'Available'),(2032,42,531,'Available'),(2033,42,532,'Available'),(2034,42,533,'Available'),(2035,42,534,'Available'),(2036,42,535,'Available'),(2037,42,536,'Available'),(2038,42,537,'Available'),(2039,42,538,'Available'),(2040,42,539,'Available'),(2041,42,540,'Available'),(2042,42,541,'Available'),(2043,42,542,'Available'),(2044,42,543,'Available'),(2045,42,544,'Available'),(2046,42,545,'Available'),(2047,42,546,'Available'),(2048,42,547,'Available'),(2049,42,548,'Available'),(2050,42,549,'Available'),(2051,42,550,'Available'),(2052,42,551,'Available'),(2053,42,552,'Available'),(2054,42,553,'Available'),(2055,42,554,'Available'),(2056,42,555,'Available'),(2057,42,556,'Available'),(2058,42,557,'Available'),(2059,42,558,'Available'),(2060,42,559,'Available'),(2061,42,560,'Available'),(2062,42,561,'Available'),(2063,42,562,'Available'),(2064,42,563,'Available'),(2065,42,564,'Available'),(2066,42,565,'Available'),(2067,42,566,'Available'),(2068,42,567,'Available'),(2069,42,568,'Available'),(2070,42,569,'Available'),(2071,42,570,'Available'),(2072,42,571,'Available'),(2073,42,572,'Available'),(2074,42,573,'Available'),(2075,42,574,'Available'),(2076,42,575,'Available'),(2077,42,576,'Available'),(2078,42,577,'Available'),(2079,42,578,'Available'),(2080,42,579,'Available'),(2081,42,580,'Available'),(2082,42,581,'Available'),(2083,42,582,'Available'),(2084,42,583,'Available'),(2085,42,584,'Available'),(2086,42,585,'Available'),(2087,42,586,'Available'),(2088,42,587,'Available'),(2089,42,588,'Available'),(2090,42,589,'Available'),(2091,42,590,'Available'),(2092,42,591,'Available'),(2093,42,592,'Available'),(2094,42,593,'Available'),(2095,42,594,'Available'),(2096,42,595,'Available'),(2097,42,596,'Available'),(2098,42,597,'Available'),(2099,42,598,'Available'),(2100,42,599,'Available'),(2101,42,600,'Available'),(2102,42,601,'Available'),(2103,42,602,'Available'),(2104,42,603,'Available'),(2105,42,604,'Available'),(2106,42,605,'Available'),(2107,42,606,'Available'),(2108,42,607,'Available'),(2109,42,608,'Available'),(2110,42,609,'Available'),(2111,42,610,'Available'),(2112,42,611,'Available'),(2113,42,612,'Available'),(2114,42,613,'Available'),(2115,42,614,'Available'),(2116,42,615,'Available'),(2117,42,616,'Available'),(2118,42,617,'Available'),(2119,42,618,'Available'),(2120,42,619,'Available'),(2121,42,620,'Available'),(2122,42,621,'Available'),(2123,42,622,'Available'),(2124,42,623,'Available'),(2125,42,624,'Available'),(2126,42,625,'Available'),(2127,42,626,'Available'),(2128,42,627,'Available'),(2129,42,628,'Available'),(2130,42,629,'Available'),(2131,42,630,'Available'),(2132,42,631,'Available'),(2133,42,632,'Available'),(2134,42,633,'Available'),(2135,42,634,'Available'),(2136,42,635,'Available'),(2137,42,636,'Available'),(2138,42,637,'Available'),(2139,42,638,'Available'),(2140,42,639,'Available'),(2141,42,640,'Available'),(2142,42,641,'Available'),(2143,42,642,'Available'),(2144,42,643,'Available'),(2145,42,644,'Available'),(2146,42,645,'Available'),(2147,42,646,'Available'),(2148,42,647,'Available'),(2149,42,648,'Available'),(2150,42,649,'Available'),(2151,42,650,'Available'),(2152,42,651,'Available'),(2153,42,652,'Available'),(2154,42,653,'Available'),(2155,42,654,'Available'),(2156,42,655,'Available'),(2157,42,656,'Available'),(2158,42,657,'Available'),(2159,42,658,'Available'),(2160,42,659,'Available'),(2161,42,660,'Available'),(2162,42,661,'Available'),(2163,42,662,'Available'),(2164,42,663,'Booked'),(2165,42,664,'Booked'),(2166,42,665,'Available'),(2167,42,666,'Available'),(2168,42,667,'Available'),(2169,42,668,'Available'),(2170,42,669,'Available'),(2171,42,670,'Available'),(2172,42,671,'Available'),(2173,42,672,'Available'),(2174,42,673,'Available'),(2175,42,674,'Available'),(2176,42,675,'Available'),(2177,42,676,'Available'),(2178,42,677,'Available'),(2179,42,678,'Available'),(2180,42,679,'Available'),(2181,42,680,'Available'),(2182,42,681,'Available'),(2183,42,682,'Booked'),(2184,42,683,'Available'),(2185,42,684,'Available'),(2186,42,685,'Available'),(2187,42,686,'Available'),(2188,42,687,'Available'),(2189,42,688,'Available'),(2190,42,689,'Available'),(2191,42,690,'Available'),(2192,42,691,'Available'),(2193,42,692,'Available'),(2194,42,693,'Available'),(2195,42,694,'Available'),(2196,42,695,'Available'),(2197,42,696,'Available'),(2198,42,697,'Available'),(2199,42,698,'Available'),(2200,42,699,'Available'),(2201,42,700,'Available'),(2202,42,701,'Available'),(2203,42,702,'Available'),(2204,42,703,'Available'),(2205,42,704,'Available'),(2206,42,705,'Available'),(2207,42,706,'Available'),(2208,42,707,'Available'),(2209,42,708,'Available'),(2210,42,709,'Available'),(2211,42,710,'Available'),(2212,42,711,'Available'),(2213,42,712,'Available'),(2214,42,713,'Available'),(2215,42,714,'Available'),(2216,42,715,'Available'),(2217,42,716,'Available'),(2218,42,717,'Available'),(2219,42,718,'Available'),(2220,42,719,'Available'),(2221,42,720,'Available'),(2222,42,721,'Available'),(2223,42,722,'Available'),(2224,42,723,'Available'),(2225,42,724,'Available'),(2226,42,725,'Available'),(2227,42,726,'Available'),(2228,42,727,'Available'),(2229,43,488,'Available'),(2230,43,489,'Available'),(2231,43,490,'Available'),(2232,43,491,'Available'),(2233,43,492,'Available'),(2234,43,493,'Available'),(2235,43,494,'Available'),(2236,43,495,'Available'),(2237,43,496,'Available'),(2238,43,497,'Available'),(2239,43,498,'Available'),(2240,43,499,'Available'),(2241,43,500,'Available'),(2242,43,501,'Available'),(2243,43,502,'Available'),(2244,43,503,'Available'),(2245,43,504,'Available'),(2246,43,505,'Available'),(2247,43,506,'Available'),(2248,43,507,'Available'),(2249,43,508,'Available'),(2250,43,509,'Available'),(2251,43,510,'Available'),(2252,43,511,'Available'),(2253,43,512,'Available'),(2254,43,513,'Available'),(2255,43,514,'Available'),(2256,43,515,'Available'),(2257,43,516,'Available'),(2258,43,517,'Available'),(2259,43,518,'Available'),(2260,43,519,'Available'),(2261,43,520,'Available'),(2262,43,521,'Available'),(2263,43,522,'Available'),(2264,43,523,'Available'),(2265,43,524,'Available'),(2266,43,525,'Available'),(2267,43,526,'Available'),(2268,43,527,'Available'),(2269,43,528,'Available'),(2270,43,529,'Available'),(2271,43,530,'Available'),(2272,43,531,'Available'),(2273,43,532,'Available'),(2274,43,533,'Available'),(2275,43,534,'Available'),(2276,43,535,'Available'),(2277,43,536,'Available'),(2278,43,537,'Available'),(2279,43,538,'Available'),(2280,43,539,'Available'),(2281,43,540,'Available'),(2282,43,541,'Available'),(2283,43,542,'Available'),(2284,43,543,'Available'),(2285,43,544,'Available'),(2286,43,545,'Available'),(2287,43,546,'Available'),(2288,43,547,'Available'),(2289,43,548,'Available'),(2290,43,549,'Available'),(2291,43,550,'Available'),(2292,43,551,'Available'),(2293,43,552,'Available'),(2294,43,553,'Available'),(2295,43,554,'Available'),(2296,43,555,'Available'),(2297,43,556,'Available'),(2298,43,557,'Available'),(2299,43,558,'Available'),(2300,43,559,'Available'),(2301,43,560,'Available'),(2302,43,561,'Available'),(2303,43,562,'Available'),(2304,43,563,'Available'),(2305,43,564,'Available'),(2306,43,565,'Available'),(2307,43,566,'Available'),(2308,43,567,'Available'),(2309,43,568,'Available'),(2310,43,569,'Available'),(2311,43,570,'Available'),(2312,43,571,'Available'),(2313,43,572,'Available'),(2314,43,573,'Available'),(2315,43,574,'Available'),(2316,43,575,'Available'),(2317,43,576,'Available'),(2318,43,577,'Available'),(2319,43,578,'Available'),(2320,43,579,'Available'),(2321,43,580,'Available'),(2322,43,581,'Available'),(2323,43,582,'Available'),(2324,43,583,'Available'),(2325,43,584,'Available'),(2326,43,585,'Available'),(2327,43,586,'Available'),(2328,43,587,'Available'),(2329,43,588,'Available'),(2330,43,589,'Available'),(2331,43,590,'Available'),(2332,43,591,'Available'),(2333,43,592,'Available'),(2334,43,593,'Available'),(2335,43,594,'Available'),(2336,43,595,'Available'),(2337,43,596,'Available'),(2338,43,597,'Available'),(2339,43,598,'Available'),(2340,43,599,'Available'),(2341,43,600,'Available'),(2342,43,601,'Available'),(2343,43,602,'Available'),(2344,43,603,'Available'),(2345,43,604,'Available'),(2346,43,605,'Available'),(2347,43,606,'Available'),(2348,43,607,'Available'),(2349,43,608,'Available'),(2350,43,609,'Available'),(2351,43,610,'Available'),(2352,43,611,'Available'),(2353,43,612,'Available'),(2354,43,613,'Available'),(2355,43,614,'Available'),(2356,43,615,'Available'),(2357,43,616,'Available'),(2358,43,617,'Available'),(2359,43,618,'Available'),(2360,43,619,'Available'),(2361,43,620,'Available'),(2362,43,621,'Available'),(2363,43,622,'Available'),(2364,43,623,'Available'),(2365,43,624,'Available'),(2366,43,625,'Available'),(2367,43,626,'Available'),(2368,43,627,'Available'),(2369,43,628,'Available'),(2370,43,629,'Available'),(2371,43,630,'Available'),(2372,43,631,'Available'),(2373,43,632,'Available'),(2374,43,633,'Available'),(2375,43,634,'Available'),(2376,43,635,'Available'),(2377,43,636,'Available'),(2378,43,637,'Available'),(2379,43,638,'Available'),(2380,43,639,'Available'),(2381,43,640,'Available'),(2382,43,641,'Available'),(2383,43,642,'Available'),(2384,43,643,'Available'),(2385,43,644,'Available'),(2386,43,645,'Available'),(2387,43,646,'Available'),(2388,43,647,'Available'),(2389,43,648,'Available'),(2390,43,649,'Available'),(2391,43,650,'Available'),(2392,43,651,'Available'),(2393,43,652,'Available'),(2394,43,653,'Available'),(2395,43,654,'Available'),(2396,43,655,'Available'),(2397,43,656,'Available'),(2398,43,657,'Available'),(2399,43,658,'Available'),(2400,43,659,'Available'),(2401,43,660,'Available'),(2402,43,661,'Available'),(2403,43,662,'Available'),(2404,43,663,'Available'),(2405,43,664,'Available'),(2406,43,665,'Available'),(2407,43,666,'Available'),(2408,43,667,'Available'),(2409,43,668,'Available'),(2410,43,669,'Available'),(2411,43,670,'Available'),(2412,43,671,'Available'),(2413,43,672,'Available'),(2414,43,673,'Available'),(2415,43,674,'Available'),(2416,43,675,'Available'),(2417,43,676,'Available'),(2418,43,677,'Available'),(2419,43,678,'Available'),(2420,43,679,'Available'),(2421,43,680,'Available'),(2422,43,681,'Available'),(2423,43,682,'Available'),(2424,43,683,'Available'),(2425,43,684,'Available'),(2426,43,685,'Available'),(2427,43,686,'Available'),(2428,43,687,'Available'),(2429,43,688,'Available'),(2430,43,689,'Available'),(2431,43,690,'Available'),(2432,43,691,'Available'),(2433,43,692,'Available'),(2434,43,693,'Available'),(2435,43,694,'Available'),(2436,43,695,'Available'),(2437,43,696,'Available'),(2438,43,697,'Available'),(2439,43,698,'Available'),(2440,43,699,'Available'),(2441,43,700,'Available'),(2442,43,701,'Available'),(2443,43,702,'Available'),(2444,43,703,'Available'),(2445,43,704,'Available'),(2446,43,705,'Available'),(2447,43,706,'Available'),(2448,43,707,'Available'),(2449,43,708,'Available'),(2450,43,709,'Available'),(2451,43,710,'Available'),(2452,43,711,'Available'),(2453,43,712,'Available'),(2454,43,713,'Available'),(2455,43,714,'Available'),(2456,43,715,'Available'),(2457,43,716,'Available'),(2458,43,717,'Available'),(2459,43,718,'Available'),(2460,43,719,'Available'),(2461,43,720,'Available'),(2462,43,721,'Available'),(2463,43,722,'Available'),(2464,43,723,'Available'),(2465,43,724,'Available'),(2466,43,725,'Available'),(2467,43,726,'Available'),(2468,43,727,'Available'),(2469,44,488,'Available'),(2470,44,489,'Available'),(2471,44,490,'Available'),(2472,44,491,'Available'),(2473,44,492,'Available'),(2474,44,493,'Available'),(2475,44,494,'Available'),(2476,44,495,'Available'),(2477,44,496,'Available'),(2478,44,497,'Available'),(2479,44,498,'Available'),(2480,44,499,'Available'),(2481,44,500,'Available'),(2482,44,501,'Available'),(2483,44,502,'Available'),(2484,44,503,'Available'),(2485,44,504,'Available'),(2486,44,505,'Available'),(2487,44,506,'Available'),(2488,44,507,'Available'),(2489,44,508,'Available'),(2490,44,509,'Available'),(2491,44,510,'Available'),(2492,44,511,'Available'),(2493,44,512,'Available'),(2494,44,513,'Available'),(2495,44,514,'Available'),(2496,44,515,'Available'),(2497,44,516,'Available'),(2498,44,517,'Available'),(2499,44,518,'Available'),(2500,44,519,'Available'),(2501,44,520,'Available'),(2502,44,521,'Available'),(2503,44,522,'Available'),(2504,44,523,'Available'),(2505,44,524,'Available'),(2506,44,525,'Available'),(2507,44,526,'Available'),(2508,44,527,'Available'),(2509,44,528,'Available'),(2510,44,529,'Available'),(2511,44,530,'Available'),(2512,44,531,'Available'),(2513,44,532,'Available'),(2514,44,533,'Available'),(2515,44,534,'Available'),(2516,44,535,'Available'),(2517,44,536,'Available'),(2518,44,537,'Available'),(2519,44,538,'Available'),(2520,44,539,'Available'),(2521,44,540,'Available'),(2522,44,541,'Available'),(2523,44,542,'Available'),(2524,44,543,'Available'),(2525,44,544,'Available'),(2526,44,545,'Available'),(2527,44,546,'Available'),(2528,44,547,'Available'),(2529,44,548,'Available'),(2530,44,549,'Available'),(2531,44,550,'Available'),(2532,44,551,'Available'),(2533,44,552,'Available'),(2534,44,553,'Available'),(2535,44,554,'Available'),(2536,44,555,'Available'),(2537,44,556,'Available'),(2538,44,557,'Available'),(2539,44,558,'Available'),(2540,44,559,'Available'),(2541,44,560,'Available'),(2542,44,561,'Available'),(2543,44,562,'Available'),(2544,44,563,'Available'),(2545,44,564,'Available'),(2546,44,565,'Available'),(2547,44,566,'Available'),(2548,44,567,'Available'),(2549,44,568,'Available'),(2550,44,569,'Available'),(2551,44,570,'Available'),(2552,44,571,'Available'),(2553,44,572,'Available'),(2554,44,573,'Available'),(2555,44,574,'Available'),(2556,44,575,'Available'),(2557,44,576,'Available'),(2558,44,577,'Available'),(2559,44,578,'Available'),(2560,44,579,'Available'),(2561,44,580,'Available'),(2562,44,581,'Available'),(2563,44,582,'Available'),(2564,44,583,'Available'),(2565,44,584,'Available'),(2566,44,585,'Available'),(2567,44,586,'Available'),(2568,44,587,'Available'),(2569,44,588,'Available'),(2570,44,589,'Available'),(2571,44,590,'Available'),(2572,44,591,'Available'),(2573,44,592,'Available'),(2574,44,593,'Available'),(2575,44,594,'Available'),(2576,44,595,'Available'),(2577,44,596,'Available'),(2578,44,597,'Available'),(2579,44,598,'Available'),(2580,44,599,'Available'),(2581,44,600,'Available'),(2582,44,601,'Available'),(2583,44,602,'Available'),(2584,44,603,'Available'),(2585,44,604,'Available'),(2586,44,605,'Available'),(2587,44,606,'Available'),(2588,44,607,'Available'),(2589,44,608,'Available'),(2590,44,609,'Available'),(2591,44,610,'Available'),(2592,44,611,'Available'),(2593,44,612,'Available'),(2594,44,613,'Available'),(2595,44,614,'Available'),(2596,44,615,'Available'),(2597,44,616,'Available'),(2598,44,617,'Available'),(2599,44,618,'Available'),(2600,44,619,'Available'),(2601,44,620,'Available'),(2602,44,621,'Available'),(2603,44,622,'Available'),(2604,44,623,'Available'),(2605,44,624,'Available'),(2606,44,625,'Available'),(2607,44,626,'Available'),(2608,44,627,'Available'),(2609,44,628,'Available'),(2610,44,629,'Available'),(2611,44,630,'Available'),(2612,44,631,'Available'),(2613,44,632,'Available'),(2614,44,633,'Available'),(2615,44,634,'Available'),(2616,44,635,'Available'),(2617,44,636,'Available'),(2618,44,637,'Available'),(2619,44,638,'Available'),(2620,44,639,'Available'),(2621,44,640,'Available'),(2622,44,641,'Available'),(2623,44,642,'Available'),(2624,44,643,'Available'),(2625,44,644,'Available'),(2626,44,645,'Available'),(2627,44,646,'Available'),(2628,44,647,'Available'),(2629,44,648,'Available'),(2630,44,649,'Available'),(2631,44,650,'Available'),(2632,44,651,'Available'),(2633,44,652,'Available'),(2634,44,653,'Available'),(2635,44,654,'Available'),(2636,44,655,'Available'),(2637,44,656,'Available'),(2638,44,657,'Available'),(2639,44,658,'Available'),(2640,44,659,'Available'),(2641,44,660,'Available'),(2642,44,661,'Available'),(2643,44,662,'Available'),(2644,44,663,'Available'),(2645,44,664,'Available'),(2646,44,665,'Available'),(2647,44,666,'Available'),(2648,44,667,'Available'),(2649,44,668,'Available'),(2650,44,669,'Available'),(2651,44,670,'Available'),(2652,44,671,'Available'),(2653,44,672,'Available'),(2654,44,673,'Available'),(2655,44,674,'Available'),(2656,44,675,'Available'),(2657,44,676,'Available'),(2658,44,677,'Available'),(2659,44,678,'Available'),(2660,44,679,'Available'),(2661,44,680,'Available'),(2662,44,681,'Available'),(2663,44,682,'Available'),(2664,44,683,'Available'),(2665,44,684,'Available'),(2666,44,685,'Available'),(2667,44,686,'Available'),(2668,44,687,'Available'),(2669,44,688,'Available'),(2670,44,689,'Available'),(2671,44,690,'Available'),(2672,44,691,'Available'),(2673,44,692,'Available'),(2674,44,693,'Available'),(2675,44,694,'Available'),(2676,44,695,'Available'),(2677,44,696,'Available'),(2678,44,697,'Available'),(2679,44,698,'Available'),(2680,44,699,'Available'),(2681,44,700,'Available'),(2682,44,701,'Available'),(2683,44,702,'Available'),(2684,44,703,'Available'),(2685,44,704,'Available'),(2686,44,705,'Available'),(2687,44,706,'Available'),(2688,44,707,'Available'),(2689,44,708,'Available'),(2690,44,709,'Available'),(2691,44,710,'Available'),(2692,44,711,'Available'),(2693,44,712,'Available'),(2694,44,713,'Available'),(2695,44,714,'Available'),(2696,44,715,'Available'),(2697,44,716,'Available'),(2698,44,717,'Available'),(2699,44,718,'Available'),(2700,44,719,'Available'),(2701,44,720,'Available'),(2702,44,721,'Available'),(2703,44,722,'Available'),(2704,44,723,'Available'),(2705,44,724,'Available'),(2706,44,725,'Available'),(2707,44,726,'Available'),(2708,44,727,'Available'),(2709,45,1,'Available'),(2710,45,2,'Available'),(2711,45,4,'Available'),(2712,45,7,'Booked');
/*!40000 ALTER TABLE `flight_seat` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invalidated_token`
--

DROP TABLE IF EXISTS `invalidated_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invalidated_token` (
  `id` varchar(255) NOT NULL,
  `expiry_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invalidated_token`
--

LOCK TABLES `invalidated_token` WRITE;
/*!40000 ALTER TABLE `invalidated_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `invalidated_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passenger`
--

DROP TABLE IF EXISTS `passenger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passenger` (
  `passenger_id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`passenger_id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passenger`
--

LOCK TABLES `passenger` WRITE;
/*!40000 ALTER TABLE `passenger` DISABLE KEYS */;
INSERT INTO `passenger` VALUES (1,'Huyền Bùi','2005-07-02','Male','Vietnam'),(17,'minh van','2006-07-02','1','Vietnam'),(18,'nguyen van b','2006-07-02','0','Vietnam'),(20,'nguyen van b','2006-07-02','0','Vietnam'),(22,'nguyen van c','2006-07-02','0','Vietnam'),(23,'nguyen van d','2006-07-02','0','Vietnam'),(24,'nguyen van E','2006-07-02','0','Vietnam'),(25,'nguyen van E','2006-07-02','0','Vietnam'),(26,'nguyen van E','2006-07-02','2','Vietnam'),(27,'nguyen van E','2006-07-02','1','Vietnam'),(28,'nguyen van t','2006-07-02','Female','Vietnam'),(29,'nguyen van t','2006-07-02','Female','Vietnam');
/*!40000 ALTER TABLE `passenger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_otp`
--

DROP TABLE IF EXISTS `password_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_otp` (
  `otp` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  `is_valid` tinyint NOT NULL DEFAULT '1',
  `expiry_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`otp`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_otp_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_otp`
--

LOCK TABLES `password_otp` WRITE;
/*!40000 ALTER TABLE `password_otp` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` enum('Success','Failed','Pending') DEFAULT 'Pending',
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `permission_name` varchar(100) NOT NULL,
  `resource` varchar(50) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`permission_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_name` varchar(50) NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`role_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES ('ADMIN','Admin role'),('USER','User role');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission`
--

DROP TABLE IF EXISTS `role_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission` (
  `role_name` varchar(50) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  PRIMARY KEY (`role_name`,`permission_name`),
  KEY `permission_name` (`permission_name`),
  CONSTRAINT `role_permission_ibfk_1` FOREIGN KEY (`role_name`) REFERENCES `role` (`role_name`) ON DELETE CASCADE,
  CONSTRAINT `role_permission_ibfk_2` FOREIGN KEY (`permission_name`) REFERENCES `permission` (`permission_name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission`
--

LOCK TABLES `role_permission` WRITE;
/*!40000 ALTER TABLE `role_permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seat_map`
--

DROP TABLE IF EXISTS `seat_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seat_map` (
  `seat_map_id` int NOT NULL AUTO_INCREMENT,
  `aircraft_type_id` int NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `seat_class` enum('ECONOMY','BUSINESS_PREMIER','PREMIUM_ECONOMY') NOT NULL,
  `seat_type` enum('WINDOW','AISLE','MIDDLE','EXIT_ROW') DEFAULT NULL,
  `visual_row` int DEFAULT NULL,
  `visual_col` int DEFAULT NULL,
  PRIMARY KEY (`seat_map_id`),
  UNIQUE KEY `aircraft_type_id` (`aircraft_type_id`,`seat_number`),
  CONSTRAINT `seat_map_ibfk_1` FOREIGN KEY (`aircraft_type_id`) REFERENCES `aircraft_type` (`aircraft_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1448 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seat_map`
--

LOCK TABLES `seat_map` WRITE;
/*!40000 ALTER TABLE `seat_map` DISABLE KEYS */;
INSERT INTO `seat_map` VALUES (1,2,'1A','ECONOMY','WINDOW',NULL,NULL),(2,2,'2A','ECONOMY','WINDOW',NULL,NULL),(4,2,'3A','ECONOMY','WINDOW',NULL,NULL),(7,2,'4A','ECONOMY','WINDOW',2,3),(488,8,'1A','BUSINESS_PREMIER','WINDOW',1,1),(489,8,'1B','BUSINESS_PREMIER','MIDDLE',1,2),(490,8,'1C','BUSINESS_PREMIER','AISLE',1,3),(491,8,'1D','BUSINESS_PREMIER','MIDDLE',1,4),(492,8,'1E','BUSINESS_PREMIER','MIDDLE',1,5),(493,8,'1F','BUSINESS_PREMIER','WINDOW',1,6),(494,8,'2A','BUSINESS_PREMIER','WINDOW',2,1),(495,8,'2B','BUSINESS_PREMIER','MIDDLE',2,2),(496,8,'2C','BUSINESS_PREMIER','AISLE',2,3),(497,8,'2D','BUSINESS_PREMIER','MIDDLE',2,4),(498,8,'2E','BUSINESS_PREMIER','MIDDLE',2,5),(499,8,'2F','BUSINESS_PREMIER','WINDOW',2,6),(500,8,'3A','BUSINESS_PREMIER','WINDOW',3,1),(501,8,'3B','BUSINESS_PREMIER','MIDDLE',3,2),(502,8,'3C','BUSINESS_PREMIER','AISLE',3,3),(503,8,'3D','BUSINESS_PREMIER','MIDDLE',3,4),(504,8,'3E','BUSINESS_PREMIER','MIDDLE',3,5),(505,8,'3F','BUSINESS_PREMIER','WINDOW',3,6),(506,8,'4A','BUSINESS_PREMIER','WINDOW',4,1),(507,8,'4B','BUSINESS_PREMIER','MIDDLE',4,2),(508,8,'4C','BUSINESS_PREMIER','AISLE',4,3),(509,8,'4D','BUSINESS_PREMIER','MIDDLE',4,4),(510,8,'4E','BUSINESS_PREMIER','MIDDLE',4,5),(511,8,'4F','BUSINESS_PREMIER','WINDOW',4,6),(512,8,'5A','BUSINESS_PREMIER','WINDOW',5,1),(513,8,'5B','BUSINESS_PREMIER','MIDDLE',5,2),(514,8,'5C','BUSINESS_PREMIER','AISLE',5,3),(515,8,'5D','BUSINESS_PREMIER','MIDDLE',5,4),(516,8,'5E','BUSINESS_PREMIER','MIDDLE',5,5),(517,8,'5F','BUSINESS_PREMIER','WINDOW',5,6),(518,8,'6A','BUSINESS_PREMIER','WINDOW',6,1),(519,8,'6B','BUSINESS_PREMIER','MIDDLE',6,2),(520,8,'6C','BUSINESS_PREMIER','AISLE',6,3),(521,8,'6D','BUSINESS_PREMIER','MIDDLE',6,4),(522,8,'6E','BUSINESS_PREMIER','MIDDLE',6,5),(523,8,'6F','BUSINESS_PREMIER','WINDOW',6,6),(524,8,'7A','BUSINESS_PREMIER','WINDOW',7,1),(525,8,'7B','BUSINESS_PREMIER','MIDDLE',7,2),(526,8,'7C','BUSINESS_PREMIER','AISLE',7,3),(527,8,'7D','BUSINESS_PREMIER','MIDDLE',7,4),(528,8,'7E','BUSINESS_PREMIER','MIDDLE',7,5),(529,8,'7F','BUSINESS_PREMIER','WINDOW',7,6),(530,8,'8A','BUSINESS_PREMIER','WINDOW',8,1),(531,8,'8B','BUSINESS_PREMIER','MIDDLE',8,2),(532,8,'8C','BUSINESS_PREMIER','AISLE',8,3),(533,8,'8D','BUSINESS_PREMIER','MIDDLE',8,4),(534,8,'8E','BUSINESS_PREMIER','MIDDLE',8,5),(535,8,'8F','BUSINESS_PREMIER','WINDOW',8,6),(536,8,'9A','BUSINESS_PREMIER','WINDOW',9,1),(537,8,'9B','BUSINESS_PREMIER','MIDDLE',9,2),(538,8,'9C','BUSINESS_PREMIER','AISLE',9,3),(539,8,'9D','BUSINESS_PREMIER','MIDDLE',9,4),(540,8,'9E','BUSINESS_PREMIER','MIDDLE',9,5),(541,8,'9F','BUSINESS_PREMIER','WINDOW',9,6),(542,8,'10A','BUSINESS_PREMIER','WINDOW',10,1),(543,8,'10B','BUSINESS_PREMIER','MIDDLE',10,2),(544,8,'10C','BUSINESS_PREMIER','AISLE',10,3),(545,8,'10D','BUSINESS_PREMIER','MIDDLE',10,4),(546,8,'10E','BUSINESS_PREMIER','MIDDLE',10,5),(547,8,'10F','BUSINESS_PREMIER','WINDOW',10,6),(548,8,'11A','BUSINESS_PREMIER','WINDOW',11,1),(549,8,'11B','BUSINESS_PREMIER','MIDDLE',11,2),(550,8,'11C','BUSINESS_PREMIER','AISLE',11,3),(551,8,'11D','BUSINESS_PREMIER','MIDDLE',11,4),(552,8,'11E','BUSINESS_PREMIER','MIDDLE',11,5),(553,8,'11F','BUSINESS_PREMIER','WINDOW',11,6),(554,8,'12A','BUSINESS_PREMIER','WINDOW',12,1),(555,8,'12B','BUSINESS_PREMIER','MIDDLE',12,2),(556,8,'12C','BUSINESS_PREMIER','AISLE',12,3),(557,8,'12D','BUSINESS_PREMIER','MIDDLE',12,4),(558,8,'12E','BUSINESS_PREMIER','MIDDLE',12,5),(559,8,'12F','BUSINESS_PREMIER','WINDOW',12,6),(560,8,'13A','BUSINESS_PREMIER','WINDOW',13,1),(561,8,'13B','BUSINESS_PREMIER','MIDDLE',13,2),(562,8,'13C','BUSINESS_PREMIER','AISLE',13,3),(563,8,'13D','BUSINESS_PREMIER','MIDDLE',13,4),(564,8,'13E','BUSINESS_PREMIER','MIDDLE',13,5),(565,8,'13F','BUSINESS_PREMIER','WINDOW',13,6),(566,8,'14A','PREMIUM_ECONOMY','WINDOW',14,1),(567,8,'14B','PREMIUM_ECONOMY','MIDDLE',14,2),(568,8,'14C','PREMIUM_ECONOMY','AISLE',14,3),(569,8,'14D','PREMIUM_ECONOMY','MIDDLE',14,4),(570,8,'14E','PREMIUM_ECONOMY','MIDDLE',14,5),(571,8,'14F','PREMIUM_ECONOMY','WINDOW',14,6),(572,8,'15A','PREMIUM_ECONOMY','WINDOW',15,1),(573,8,'15B','PREMIUM_ECONOMY','MIDDLE',15,2),(574,8,'15C','PREMIUM_ECONOMY','AISLE',15,3),(575,8,'15D','PREMIUM_ECONOMY','MIDDLE',15,4),(576,8,'15E','PREMIUM_ECONOMY','MIDDLE',15,5),(577,8,'15F','PREMIUM_ECONOMY','WINDOW',15,6),(578,8,'16A','PREMIUM_ECONOMY','WINDOW',16,1),(579,8,'16B','PREMIUM_ECONOMY','MIDDLE',16,2),(580,8,'16C','PREMIUM_ECONOMY','AISLE',16,3),(581,8,'16D','PREMIUM_ECONOMY','MIDDLE',16,4),(582,8,'16E','PREMIUM_ECONOMY','MIDDLE',16,5),(583,8,'16F','PREMIUM_ECONOMY','WINDOW',16,6),(584,8,'17A','PREMIUM_ECONOMY','WINDOW',17,1),(585,8,'17B','PREMIUM_ECONOMY','MIDDLE',17,2),(586,8,'17C','PREMIUM_ECONOMY','AISLE',17,3),(587,8,'17D','PREMIUM_ECONOMY','MIDDLE',17,4),(588,8,'17E','PREMIUM_ECONOMY','MIDDLE',17,5),(589,8,'17F','PREMIUM_ECONOMY','WINDOW',17,6),(590,8,'18A','PREMIUM_ECONOMY','WINDOW',18,1),(591,8,'18B','PREMIUM_ECONOMY','MIDDLE',18,2),(592,8,'18C','PREMIUM_ECONOMY','AISLE',18,3),(593,8,'18D','PREMIUM_ECONOMY','MIDDLE',18,4),(594,8,'18E','PREMIUM_ECONOMY','MIDDLE',18,5),(595,8,'18F','PREMIUM_ECONOMY','WINDOW',18,6),(596,8,'19A','PREMIUM_ECONOMY','WINDOW',19,1),(597,8,'19B','PREMIUM_ECONOMY','MIDDLE',19,2),(598,8,'19C','PREMIUM_ECONOMY','AISLE',19,3),(599,8,'19D','PREMIUM_ECONOMY','MIDDLE',19,4),(600,8,'19E','PREMIUM_ECONOMY','MIDDLE',19,5),(601,8,'19F','PREMIUM_ECONOMY','WINDOW',19,6),(602,8,'20A','PREMIUM_ECONOMY','WINDOW',20,1),(603,8,'20B','PREMIUM_ECONOMY','MIDDLE',20,2),(604,8,'20C','PREMIUM_ECONOMY','AISLE',20,3),(605,8,'20D','PREMIUM_ECONOMY','MIDDLE',20,4),(606,8,'20E','PREMIUM_ECONOMY','MIDDLE',20,5),(607,8,'20F','PREMIUM_ECONOMY','WINDOW',20,6),(608,8,'21A','PREMIUM_ECONOMY','WINDOW',21,1),(609,8,'21B','PREMIUM_ECONOMY','MIDDLE',21,2),(610,8,'21C','PREMIUM_ECONOMY','AISLE',21,3),(611,8,'21D','PREMIUM_ECONOMY','MIDDLE',21,4),(612,8,'21E','PREMIUM_ECONOMY','MIDDLE',21,5),(613,8,'21F','PREMIUM_ECONOMY','WINDOW',21,6),(614,8,'22A','PREMIUM_ECONOMY','WINDOW',22,1),(615,8,'22B','PREMIUM_ECONOMY','MIDDLE',22,2),(616,8,'22C','PREMIUM_ECONOMY','AISLE',22,3),(617,8,'22D','PREMIUM_ECONOMY','MIDDLE',22,4),(618,8,'22E','PREMIUM_ECONOMY','MIDDLE',22,5),(619,8,'22F','PREMIUM_ECONOMY','WINDOW',22,6),(620,8,'23A','PREMIUM_ECONOMY','WINDOW',23,1),(621,8,'23B','PREMIUM_ECONOMY','MIDDLE',23,2),(622,8,'23C','PREMIUM_ECONOMY','AISLE',23,3),(623,8,'23D','PREMIUM_ECONOMY','MIDDLE',23,4),(624,8,'23E','PREMIUM_ECONOMY','MIDDLE',23,5),(625,8,'23F','PREMIUM_ECONOMY','WINDOW',23,6),(626,8,'24A','PREMIUM_ECONOMY','WINDOW',24,1),(627,8,'24B','PREMIUM_ECONOMY','MIDDLE',24,2),(628,8,'24C','PREMIUM_ECONOMY','AISLE',24,3),(629,8,'24D','PREMIUM_ECONOMY','MIDDLE',24,4),(630,8,'24E','PREMIUM_ECONOMY','MIDDLE',24,5),(631,8,'24F','PREMIUM_ECONOMY','WINDOW',24,6),(632,8,'25A','PREMIUM_ECONOMY','WINDOW',25,1),(633,8,'25B','PREMIUM_ECONOMY','MIDDLE',25,2),(634,8,'25C','PREMIUM_ECONOMY','AISLE',25,3),(635,8,'25D','PREMIUM_ECONOMY','MIDDLE',25,4),(636,8,'25E','PREMIUM_ECONOMY','MIDDLE',25,5),(637,8,'25F','PREMIUM_ECONOMY','WINDOW',25,6),(638,8,'26A','PREMIUM_ECONOMY','WINDOW',26,1),(639,8,'26B','PREMIUM_ECONOMY','MIDDLE',26,2),(640,8,'26C','PREMIUM_ECONOMY','AISLE',26,3),(641,8,'26D','PREMIUM_ECONOMY','MIDDLE',26,4),(642,8,'26E','PREMIUM_ECONOMY','MIDDLE',26,5),(643,8,'26F','PREMIUM_ECONOMY','WINDOW',26,6),(644,8,'27A','ECONOMY','WINDOW',27,1),(645,8,'27B','ECONOMY','MIDDLE',27,2),(646,8,'27C','ECONOMY','AISLE',27,3),(647,8,'27D','ECONOMY','MIDDLE',27,4),(648,8,'27E','ECONOMY','MIDDLE',27,5),(649,8,'27F','ECONOMY','WINDOW',27,6),(650,8,'28A','ECONOMY','WINDOW',28,1),(651,8,'28B','ECONOMY','MIDDLE',28,2),(652,8,'28C','ECONOMY','AISLE',28,3),(653,8,'28D','ECONOMY','MIDDLE',28,4),(654,8,'28E','ECONOMY','MIDDLE',28,5),(655,8,'28F','ECONOMY','WINDOW',28,6),(656,8,'29A','ECONOMY','WINDOW',29,1),(657,8,'29B','ECONOMY','MIDDLE',29,2),(658,8,'29C','ECONOMY','AISLE',29,3),(659,8,'29D','ECONOMY','MIDDLE',29,4),(660,8,'29E','ECONOMY','MIDDLE',29,5),(661,8,'29F','ECONOMY','WINDOW',29,6),(662,8,'30A','ECONOMY','WINDOW',30,1),(663,8,'30B','ECONOMY','MIDDLE',30,2),(664,8,'30C','ECONOMY','AISLE',30,3),(665,8,'30D','ECONOMY','MIDDLE',30,4),(666,8,'30E','ECONOMY','MIDDLE',30,5),(667,8,'30F','ECONOMY','WINDOW',30,6),(668,8,'31A','ECONOMY','WINDOW',31,1),(669,8,'31B','ECONOMY','MIDDLE',31,2),(670,8,'31C','ECONOMY','AISLE',31,3),(671,8,'31D','ECONOMY','MIDDLE',31,4),(672,8,'31E','ECONOMY','MIDDLE',31,5),(673,8,'31F','ECONOMY','WINDOW',31,6),(674,8,'32A','ECONOMY','WINDOW',32,1),(675,8,'32B','ECONOMY','MIDDLE',32,2),(676,8,'32C','ECONOMY','AISLE',32,3),(677,8,'32D','ECONOMY','MIDDLE',32,4),(678,8,'32E','ECONOMY','MIDDLE',32,5),(679,8,'32F','ECONOMY','WINDOW',32,6),(680,8,'33A','ECONOMY','WINDOW',33,1),(681,8,'33B','ECONOMY','MIDDLE',33,2),(682,8,'33C','ECONOMY','AISLE',33,3),(683,8,'33D','ECONOMY','MIDDLE',33,4),(684,8,'33E','ECONOMY','MIDDLE',33,5),(685,8,'33F','ECONOMY','WINDOW',33,6),(686,8,'34A','ECONOMY','WINDOW',34,1),(687,8,'34B','ECONOMY','MIDDLE',34,2),(688,8,'34C','ECONOMY','AISLE',34,3),(689,8,'34D','ECONOMY','MIDDLE',34,4),(690,8,'34E','ECONOMY','MIDDLE',34,5),(691,8,'34F','ECONOMY','WINDOW',34,6),(692,8,'35A','ECONOMY','WINDOW',35,1),(693,8,'35B','ECONOMY','MIDDLE',35,2),(694,8,'35C','ECONOMY','AISLE',35,3),(695,8,'35D','ECONOMY','MIDDLE',35,4),(696,8,'35E','ECONOMY','MIDDLE',35,5),(697,8,'35F','ECONOMY','WINDOW',35,6),(698,8,'36A','ECONOMY','WINDOW',36,1),(699,8,'36B','ECONOMY','MIDDLE',36,2),(700,8,'36C','ECONOMY','AISLE',36,3),(701,8,'36D','ECONOMY','MIDDLE',36,4),(702,8,'36E','ECONOMY','MIDDLE',36,5),(703,8,'36F','ECONOMY','WINDOW',36,6),(704,8,'37A','ECONOMY','WINDOW',37,1),(705,8,'37B','ECONOMY','MIDDLE',37,2),(706,8,'37C','ECONOMY','AISLE',37,3),(707,8,'37D','ECONOMY','MIDDLE',37,4),(708,8,'37E','ECONOMY','MIDDLE',37,5),(709,8,'37F','ECONOMY','WINDOW',37,6),(710,8,'38A','ECONOMY','WINDOW',38,1),(711,8,'38B','ECONOMY','MIDDLE',38,2),(712,8,'38C','ECONOMY','AISLE',38,3),(713,8,'38D','ECONOMY','MIDDLE',38,4),(714,8,'38E','ECONOMY','MIDDLE',38,5),(715,8,'38F','ECONOMY','WINDOW',38,6),(716,8,'39A','ECONOMY','WINDOW',39,1),(717,8,'39B','ECONOMY','MIDDLE',39,2),(718,8,'39C','ECONOMY','AISLE',39,3),(719,8,'39D','ECONOMY','MIDDLE',39,4),(720,8,'39E','ECONOMY','MIDDLE',39,5),(721,8,'39F','ECONOMY','WINDOW',39,6),(722,8,'40A','ECONOMY','WINDOW',40,1),(723,8,'40B','ECONOMY','MIDDLE',40,2),(724,8,'40C','ECONOMY','AISLE',40,3),(725,8,'40D','ECONOMY','MIDDLE',40,4),(726,8,'40E','ECONOMY','MIDDLE',40,5),(727,8,'40F','ECONOMY','WINDOW',40,6);
/*!40000 ALTER TABLE `seat_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket`
--

DROP TABLE IF EXISTS `ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `flight_id` int NOT NULL,
  `passenger_id` int NOT NULL,
  `price_id` int NOT NULL,
  `flight_seat_id` int DEFAULT NULL,
  `ticket_number` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `flight_seat_id` (`flight_seat_id`),
  UNIQUE KEY `ticket_number` (`ticket_number`),
  KEY `booking_id` (`booking_id`),
  KEY `passenger_id` (`passenger_id`),
  KEY `price_id` (`price_id`),
  KEY `idx_ticket_flight_passenger` (`flight_id`,`passenger_id`),
  CONSTRAINT `ticket_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_ibfk_2` FOREIGN KEY (`flight_id`) REFERENCES `flight` (`flight_id`),
  CONSTRAINT `ticket_ibfk_3` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`passenger_id`),
  CONSTRAINT `ticket_ibfk_4` FOREIGN KEY (`price_id`) REFERENCES `flight_price` (`price_id`),
  CONSTRAINT `ticket_ibfk_5` FOREIGN KEY (`flight_seat_id`) REFERENCES `flight_seat` (`flight_seat_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket`
--

LOCK TABLES `ticket` WRITE;
/*!40000 ALTER TABLE `ticket` DISABLE KEYS */;
INSERT INTO `ticket` VALUES (1,3,34,17,26,937,'55fef25a-423b-47d0-909e-cba53651cb46','0'),(2,4,37,18,35,1182,'532375ef-0219-4ac7-a83b-fe2a422cb65a','Issued'),(3,6,37,20,35,1183,'055d43f1-4ab0-4564-9c30-4586d3d416b7','Issued'),(4,8,37,22,35,1187,'520f0ea9-e413-4f88-8d79-6bb00f06964f','Issued'),(5,9,42,23,41,2183,'86331f7a-2fa2-4ca1-a95f-37760ac49e24','Issued'),(6,10,34,24,26,938,'a7b13ae3-09d4-46a0-b7c4-a26f717aee62','Issued'),(7,11,34,25,26,939,'b9612b6f-466e-4fe5-93fd-d29da63750ad','Issued'),(8,12,42,26,41,2165,'7f7b8718-60b4-428d-984b-ccc4d0eb0278','Issued'),(9,13,34,27,26,943,'b496549e-d743-459f-8f04-2881d12e83c6','0'),(10,14,42,28,41,2164,'da2e0a89-4f90-4400-a5a3-8cabb8494906','Issued'),(11,15,45,29,50,2712,'ec160fe4-bff0-4cb0-a084-1bde9d5963f9','Issued');
/*!40000 ALTER TABLE `ticket` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_class`
--

DROP TABLE IF EXISTS `ticket_class`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_class` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `baggage_allowance_kg` int DEFAULT '20',
  `refundable` tinyint(1) DEFAULT '0',
  `changeable` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`class_id`),
  UNIQUE KEY `class_name` (`class_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_class`
--

LOCK TABLES `ticket_class` WRITE;
/*!40000 ALTER TABLE `ticket_class` DISABLE KEYS */;
INSERT INTO `ticket_class` VALUES (1,'ECONOMY',20,0,1),(2,'BUSINESS',30,1,1),(3,'PREMIUM_ECONOMY',25,0,1);
/*!40000 ALTER TABLE `ticket_class` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  -- `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=621 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (616,'23021722@vnu.edu.vn','ducthang27','$2a$10$OoOvpreKoq.ix0Jzta3BrewZPOnLqBTzupCL1a96Z2.danr/cupEW','Kiều Đức Thắng','0917918833','2005-07-02','Male',1,0,'default avatar','2025-12-28 08:16:17','2025-12-29 20:04:42'),(617,'dllv@gmail.com','admin','$2a$10$F9Aspy/5We0HQzrg.c4oZ.J6dMQIAOnIfyhXLeeoqSLm2OxsfUfV6','Dao Le Long Vu','000000000','2005-09-06','Male',1,0,NULL,'2025-12-29 01:51:44','2025-12-29 01:51:44'),(618,'test@example.com','testuser','$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9b2.1sI.KK1aZ9e','Test User','0123456789','1990-01-01','Male',1,0,NULL,'2025-12-29 05:23:00','2025-12-29 05:23:00'),(620,'mtd150606@gmail.com','thanhduc2006','$2a$10$7R9Ku.twskZ2CuqIrNlqReDpwYtJmQGXdbKpfmssdmgUjykq1Yjf.','mai thanh duc','0000000000','2000-01-01','Other',1,0,'default avatar','2025-12-30 04:52:07','2025-12-30 04:52:07');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`user_id`,`role_name`),
  KEY `role_name` (`role_name`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_name`) REFERENCES `role` (`role_name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,'ADMIN'),(617,'ADMIN'),(110,'USER'),(111,'USER'),(112,'USER'),(113,'USER'),(114,'USER'),(115,'USER'),(116,'USER'),(117,'USER'),(118,'USER'),(119,'USER'),(120,'USER'),(121,'USER'),(122,'USER'),(123,'USER'),(124,'USER'),(125,'USER'),(126,'USER'),(127,'USER'),(128,'USER'),(129,'USER'),(130,'USER'),(131,'USER'),(132,'USER'),(133,'USER'),(134,'USER'),(135,'USER'),(136,'USER'),(137,'USER'),(138,'USER'),(139,'USER'),(140,'USER'),(141,'USER'),(142,'USER'),(143,'USER'),(144,'USER'),(145,'USER'),(146,'USER'),(147,'USER'),(148,'USER'),(149,'USER'),(150,'USER'),(151,'USER'),(152,'USER'),(153,'USER'),(154,'USER'),(155,'USER'),(156,'USER'),(157,'USER'),(158,'USER'),(159,'USER'),(160,'USER'),(161,'USER'),(162,'USER'),(163,'USER'),(164,'USER'),(165,'USER'),(166,'USER'),(167,'USER'),(168,'USER'),(169,'USER'),(170,'USER'),(171,'USER'),(172,'USER'),(173,'USER'),(174,'USER'),(175,'USER'),(176,'USER'),(177,'USER'),(178,'USER'),(179,'USER'),(180,'USER'),(181,'USER'),(182,'USER'),(183,'USER'),(184,'USER'),(185,'USER'),(186,'USER'),(187,'USER'),(188,'USER'),(189,'USER'),(190,'USER'),(191,'USER'),(192,'USER'),(193,'USER'),(194,'USER'),(195,'USER'),(196,'USER'),(197,'USER'),(198,'USER'),(199,'USER'),(200,'USER'),(201,'USER'),(202,'USER'),(203,'USER'),(204,'USER'),(205,'USER'),(206,'USER'),(207,'USER'),(208,'USER'),(209,'USER'),(210,'USER'),(211,'USER'),(212,'USER'),(213,'USER'),(214,'USER'),(215,'USER'),(216,'USER'),(217,'USER'),(218,'USER'),(219,'USER'),(220,'USER'),(221,'USER'),(222,'USER'),(223,'USER'),(224,'USER'),(225,'USER'),(226,'USER'),(227,'USER'),(228,'USER'),(229,'USER'),(230,'USER'),(231,'USER'),(232,'USER'),(233,'USER'),(234,'USER'),(235,'USER'),(236,'USER'),(237,'USER'),(238,'USER'),(239,'USER'),(240,'USER'),(241,'USER'),(242,'USER'),(243,'USER'),(244,'USER'),(245,'USER'),(246,'USER'),(247,'USER'),(248,'USER'),(249,'USER'),(250,'USER'),(251,'USER'),(252,'USER'),(253,'USER'),(254,'USER'),(255,'USER'),(256,'USER'),(257,'USER'),(258,'USER'),(259,'USER'),(260,'USER'),(261,'USER'),(262,'USER'),(263,'USER'),(264,'USER'),(265,'USER'),(266,'USER'),(267,'USER'),(268,'USER'),(269,'USER'),(270,'USER'),(271,'USER'),(272,'USER'),(273,'USER'),(274,'USER'),(275,'USER'),(276,'USER'),(277,'USER'),(278,'USER'),(279,'USER'),(280,'USER'),(281,'USER'),(282,'USER'),(283,'USER'),(284,'USER'),(285,'USER'),(286,'USER'),(287,'USER'),(288,'USER'),(289,'USER'),(290,'USER'),(291,'USER'),(292,'USER'),(293,'USER'),(294,'USER'),(295,'USER'),(296,'USER'),(297,'USER'),(298,'USER'),(299,'USER'),(300,'USER'),(301,'USER'),(302,'USER'),(303,'USER'),(304,'USER'),(305,'USER'),(306,'USER'),(307,'USER'),(308,'USER'),(309,'USER'),(310,'USER'),(311,'USER'),(312,'USER'),(313,'USER'),(314,'USER'),(315,'USER'),(316,'USER'),(317,'USER'),(318,'USER'),(319,'USER'),(320,'USER'),(321,'USER'),(322,'USER'),(323,'USER'),(324,'USER'),(325,'USER'),(326,'USER'),(327,'USER'),(328,'USER'),(329,'USER'),(330,'USER'),(331,'USER'),(332,'USER'),(333,'USER'),(334,'USER'),(335,'USER'),(336,'USER'),(337,'USER'),(338,'USER'),(339,'USER'),(340,'USER'),(341,'USER'),(342,'USER'),(343,'USER'),(344,'USER'),(345,'USER'),(346,'USER'),(347,'USER'),(348,'USER'),(349,'USER'),(350,'USER'),(351,'USER'),(352,'USER'),(353,'USER'),(354,'USER'),(355,'USER'),(356,'USER'),(357,'USER'),(358,'USER'),(359,'USER'),(360,'USER'),(361,'USER'),(362,'USER'),(363,'USER'),(364,'USER'),(365,'USER'),(366,'USER'),(367,'USER'),(368,'USER'),(369,'USER'),(370,'USER'),(371,'USER'),(372,'USER'),(373,'USER'),(374,'USER'),(375,'USER'),(376,'USER'),(377,'USER'),(378,'USER'),(379,'USER'),(380,'USER'),(381,'USER'),(382,'USER'),(383,'USER'),(384,'USER'),(385,'USER'),(386,'USER'),(387,'USER'),(388,'USER'),(389,'USER'),(390,'USER'),(391,'USER'),(392,'USER'),(393,'USER'),(394,'USER'),(395,'USER'),(396,'USER'),(397,'USER'),(398,'USER'),(399,'USER'),(400,'USER'),(401,'USER'),(402,'USER'),(403,'USER'),(404,'USER'),(405,'USER'),(406,'USER'),(407,'USER'),(408,'USER'),(409,'USER'),(410,'USER'),(411,'USER'),(412,'USER'),(413,'USER'),(414,'USER'),(415,'USER'),(416,'USER'),(417,'USER'),(418,'USER'),(419,'USER'),(420,'USER'),(421,'USER'),(422,'USER'),(423,'USER'),(424,'USER'),(425,'USER'),(426,'USER'),(427,'USER'),(428,'USER'),(429,'USER'),(430,'USER'),(431,'USER'),(432,'USER'),(433,'USER'),(434,'USER'),(435,'USER'),(436,'USER'),(437,'USER'),(438,'USER'),(439,'USER'),(440,'USER'),(441,'USER'),(442,'USER'),(443,'USER'),(444,'USER'),(445,'USER'),(446,'USER'),(447,'USER'),(448,'USER'),(449,'USER'),(450,'USER'),(451,'USER'),(452,'USER'),(453,'USER'),(454,'USER'),(455,'USER'),(456,'USER'),(457,'USER'),(458,'USER'),(459,'USER'),(460,'USER'),(461,'USER'),(462,'USER'),(463,'USER'),(464,'USER'),(465,'USER'),(466,'USER'),(467,'USER'),(468,'USER'),(469,'USER'),(470,'USER'),(471,'USER'),(472,'USER'),(473,'USER'),(474,'USER'),(475,'USER'),(476,'USER'),(477,'USER'),(478,'USER'),(479,'USER'),(480,'USER'),(481,'USER'),(482,'USER'),(483,'USER'),(484,'USER'),(485,'USER'),(486,'USER'),(487,'USER'),(488,'USER'),(489,'USER'),(490,'USER'),(491,'USER'),(492,'USER'),(493,'USER'),(494,'USER'),(495,'USER'),(496,'USER'),(497,'USER'),(498,'USER'),(499,'USER'),(500,'USER'),(501,'USER'),(502,'USER'),(503,'USER'),(504,'USER'),(505,'USER'),(506,'USER'),(507,'USER'),(508,'USER'),(509,'USER'),(510,'USER'),(511,'USER'),(512,'USER'),(513,'USER'),(514,'USER'),(515,'USER'),(516,'USER'),(517,'USER'),(518,'USER'),(519,'USER'),(520,'USER'),(521,'USER'),(522,'USER'),(523,'USER'),(524,'USER'),(525,'USER'),(526,'USER'),(527,'USER'),(528,'USER'),(529,'USER'),(530,'USER'),(531,'USER'),(532,'USER'),(533,'USER'),(534,'USER'),(535,'USER'),(536,'USER'),(537,'USER'),(538,'USER'),(539,'USER'),(540,'USER'),(541,'USER'),(542,'USER'),(543,'USER'),(544,'USER'),(545,'USER'),(546,'USER'),(547,'USER'),(548,'USER'),(549,'USER'),(550,'USER'),(551,'USER'),(552,'USER'),(553,'USER'),(554,'USER'),(555,'USER'),(556,'USER'),(557,'USER'),(558,'USER'),(559,'USER'),(560,'USER'),(561,'USER'),(562,'USER'),(563,'USER'),(564,'USER'),(565,'USER'),(566,'USER'),(567,'USER'),(568,'USER'),(569,'USER'),(570,'USER'),(571,'USER'),(572,'USER'),(573,'USER'),(574,'USER'),(575,'USER'),(576,'USER'),(577,'USER'),(578,'USER'),(579,'USER'),(580,'USER'),(581,'USER'),(582,'USER'),(583,'USER'),(584,'USER'),(585,'USER'),(586,'USER'),(587,'USER'),(588,'USER'),(589,'USER'),(590,'USER'),(591,'USER'),(592,'USER'),(593,'USER'),(594,'USER'),(595,'USER'),(596,'USER'),(597,'USER'),(598,'USER'),(599,'USER'),(600,'USER'),(601,'USER'),(602,'USER'),(603,'USER'),(604,'USER'),(605,'USER'),(606,'USER'),(607,'USER'),(608,'USER'),(609,'USER'),(610,'USER'),(611,'USER'),(612,'USER'),(613,'USER'),(614,'USER'),(615,'USER'),(616,'USER'),(618,'USER'),(620,'USER');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher`
--

DROP TABLE IF EXISTS `voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher` (
  `voucher_id` int NOT NULL AUTO_INCREMENT,
  `voucher_code` varchar(50) NOT NULL,
  `discount_type` enum('Percentage','Fixed Amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount_amount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT '0.00',
  `usage_limit` int DEFAULT '1',
  `used_count` int DEFAULT '0',
  `valid_from` datetime NOT NULL,
  `valid_to` datetime NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`voucher_id`),
  UNIQUE KEY `voucher_code` (`voucher_code`),
  CONSTRAINT `voucher_chk_1` CHECK ((`valid_to` > `valid_from`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher`
--

LOCK TABLES `voucher` WRITE;
/*!40000 ALTER TABLE `voucher` DISABLE KEYS */;
INSERT INTO `voucher` VALUES (1,'SUMMER2','Percentage',20.00,0.00,0.00,100,1,'2025-12-30 01:29:56','2026-01-31 23:59:59',1),(5,'WINTER2025','Percentage',40.00,0.00,0.00,30,0,'2025-12-30 03:56:33','2026-02-07 23:59:59',1),(6,'SOON','Percentage',30.00,0.00,0.00,10,0,'2025-12-30 04:54:42','2026-02-06 23:59:59',1);
/*!40000 ALTER TABLE `voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_usage`
--

DROP TABLE IF EXISTS `voucher_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `voucher_usage` (
  `usage_id` int NOT NULL AUTO_INCREMENT,
  `voucher_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `user_id` int NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`usage_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `voucher_id` (`voucher_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `voucher_usage_ibfk_1` FOREIGN KEY (`voucher_id`) REFERENCES `voucher` (`voucher_id`),
  CONSTRAINT `voucher_usage_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  CONSTRAINT `voucher_usage_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_usage`
--

LOCK TABLES `voucher_usage` WRITE;
/*!40000 ALTER TABLE `voucher_usage` DISABLE KEYS */;
INSERT INTO `voucher_usage` VALUES (1,1,10,616,0.00,'2025-12-29 23:08:40');
/*!40000 ALTER TABLE `voucher_usage` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-30 16:25:15
