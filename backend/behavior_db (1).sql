-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 07, 2026 at 05:46 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `behavior_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `behavior_categories`
--

CREATE TABLE `behavior_categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('positive','negative','neutral') NOT NULL,
  `default_points` int(11) NOT NULL,
  `severity_level` enum('low','medium','high','urgent') DEFAULT 'low',
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `behavior_categories`
--

INSERT INTO `behavior_categories` (`id`, `name`, `type`, `default_points`, `severity_level`, `description`, `is_active`, `created_at`) VALUES
('01199353-6ad8-4fae-822a-b41cba6604c8', 'Disruption', 'negative', -5, 'low', NULL, 1, '2026-04-06 18:10:22'),
('26c87ab9-efd2-4790-8bac-feec6b6beea9', 'Helping Peers', 'positive', 10, 'low', NULL, 1, '2026-04-06 18:10:22'),
('4ffafe3d-9a69-481e-a56a-080c626683d0', 'Fighting', 'negative', -30, 'high', NULL, 1, '2026-04-06 18:10:22'),
('6ac03359-eda0-42fd-8246-675a87c2bcc7', 'Leadership', 'positive', 20, 'medium', NULL, 1, '2026-04-06 18:10:22'),
('a71d44db-9bc2-4e03-b292-41462254e7ef', 'being late', 'negative', -3, 'high', NULL, 1, '2026-04-07 09:52:49'),
('b9ac6b69-4f05-4df9-abc0-f83312ac19f3', 'Bullying', 'negative', -50, 'urgent', NULL, 1, '2026-04-06 18:10:22');

-- --------------------------------------------------------

--
-- Table structure for table `behavior_records`
--

CREATE TABLE `behavior_records` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `recorded_by` varchar(36) NOT NULL,
  `points_applied` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `incident_date` date NOT NULL,
  `evidence_url` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','escalated') DEFAULT 'pending',
  `approved_by` varchar(36) DEFAULT NULL,
  `parent_acknowledged` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `behavior_records`
--

INSERT INTO `behavior_records` (`id`, `student_id`, `category_id`, `recorded_by`, `points_applied`, `comment`, `incident_date`, `evidence_url`, `status`, `approved_by`, `parent_acknowledged`, `created_at`, `updated_at`) VALUES
('16c25b13-0d37-47af-8d49-80fd52d1fc8a', 'e4bfb982-a5b5-42ca-8b5a-1f650af95bc5', '26c87ab9-efd2-4790-8bac-feec6b6beea9', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 10, NULL, '2026-04-07', NULL, 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 16:24:32', '2026-04-07 16:24:58'),
('32f23148-8f6e-4cb6-bb67-a230e17010cc', 'a3a501a8-af04-4f27-b522-abfd66975dc1', '6ac03359-eda0-42fd-8246-675a87c2bcc7', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 20, NULL, '2026-04-07', NULL, 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 13:06:21', '2026-04-07 16:29:19'),
('41402b01-7f54-4aef-ba77-ce139240cdbc', '02ceab15-80e7-4a8e-a87f-b09685005f53', 'b9ac6b69-4f05-4df9-abc0-f83312ac19f3', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', -50, NULL, '2026-04-07', '/uploads/evidence/evidence-1775548703216.png', 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 10:58:23', '2026-04-07 16:30:48'),
('46b08fcb-38eb-450d-ad94-ecbd65397caa', '9b1e73ac-a27e-4c77-a1a1-7b6c5ab65c06', '4ffafe3d-9a69-481e-a56a-080c626683d0', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', -30, NULL, '2026-04-07', NULL, 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 13:05:59', '2026-04-07 16:33:27'),
('812b5690-0d5b-47c8-ac38-5f01c1463769', 'e4bfb982-a5b5-42ca-8b5a-1f650af95bc5', '6ac03359-eda0-42fd-8246-675a87c2bcc7', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 20, NULL, '2026-04-07', NULL, 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 16:24:25', '2026-04-07 16:25:12'),
('d1d0ff2b-3ffa-409f-9298-d70a12d12376', 'e4bfb982-a5b5-42ca-8b5a-1f650af95bc5', '26c87ab9-efd2-4790-8bac-feec6b6beea9', '76c439ef-5482-4b79-8398-26173dfc94c8', 10, NULL, '2026-04-07', NULL, 'approved', '76c439ef-5482-4b79-8398-26173dfc94c8', 0, '2026-04-07 16:23:42', '2026-04-07 16:25:16');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` varchar(36) NOT NULL,
  `grade_level` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `supervisor_id` varchar(36) DEFAULT NULL,
  `teacher_id` varchar(36) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `grade_level`, `section`, `academic_year`, `supervisor_id`, `teacher_id`, `created_at`) VALUES
('230cbff8-abde-4e17-8345-959fcf85c572', 9, 'A', '2026', '76c439ef-5482-4b79-8398-26173dfc94c8', '285fb585-5fab-412b-a80e-fdd93cab447e', '2026-04-07 12:45:41'),
('5ccf5b6e-a772-4dee-89db-8894021c862b', 9, 'B', '2026-2027', '76c439ef-5482-4b79-8398-26173dfc94c8', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', '2026-04-06 18:10:22');

-- --------------------------------------------------------

--
-- Table structure for table `interventions`
--

CREATE TABLE `interventions` (
  `id` varchar(255) NOT NULL,
  `behavior_id` varchar(255) DEFAULT NULL,
  `action_taken` text NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `interventions`
--

INSERT INTO `interventions` (`id`, `behavior_id`, `action_taken`, `status`, `created_by`, `created_at`) VALUES
('21b32cfc-b752-4b4e-845d-5b68956d3b36', '46b08fcb-38eb-450d-ad94-ecbd65397caa', 'dis', 'completed', '76c439ef-5482-4b79-8398-26173dfc94c8', '2026-04-07 13:33:27');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('incident','report','system') NOT NULL,
  `related_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `related_id`, `is_read`, `created_at`) VALUES
('0d9664a9-894f-4909-9df8-51212097b891', '76c439ef-5482-4b79-8398-26173dfc94c8', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', 'd1d0ff2b-3ffa-409f-9298-d70a12d12376', 1, '2026-04-07 16:25:16'),
('11f57327-de47-45c4-86d7-3c88fe6e96be', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', 'd1d0ff2b-3ffa-409f-9298-d70a12d12376', 1, '2026-04-07 16:23:42'),
('1fb456bd-1f58-436c-8521-1950d9400f2d', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', '41402b01-7f54-4aef-ba77-ce139240cdbc', 1, '2026-04-07 10:58:23'),
('32d2d4e6-303c-4692-9704-6871ac21b87e', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', '46b08fcb-38eb-450d-ad94-ecbd65397caa', 1, '2026-04-07 13:05:59'),
('39b5e93c-d085-4724-9bc8-caf70b62aa37', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', '812b5690-0d5b-47c8-ac38-5f01c1463769', 1, '2026-04-07 16:25:12'),
('766addf0-e88e-42e2-8956-d4680afa5e20', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', '16c25b13-0d37-47af-8d49-80fd52d1fc8a', 1, '2026-04-07 16:24:32'),
('8239ea99-7340-4136-bdcb-1a9f03c3bdf9', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', '32f23148-8f6e-4cb6-bb67-a230e17010cc', 1, '2026-04-07 16:29:19'),
('9161f1de-d373-4b31-aa2b-95ccbfb50bb5', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', '812b5690-0d5b-47c8-ac38-5f01c1463769', 1, '2026-04-07 16:24:25'),
('a784d4d0-e541-41dd-aebb-ff96da7f29be', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', '16c25b13-0d37-47af-8d49-80fd52d1fc8a', 1, '2026-04-07 16:24:58'),
('af40b6c2-c495-4dc7-9bba-b5ab13aed659', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', '41402b01-7f54-4aef-ba77-ce139240cdbc', 1, '2026-04-07 16:30:48'),
('e2979c97-3e23-4379-a330-52493756b08f', '80b9eb11-c9dd-4771-8b7a-96ecccd30f44', 'Incident Approved', 'Your behavior record submission has been approved by the supervisor.', 'incident', '46b08fcb-38eb-450d-ad94-ecbd65397caa', 1, '2026-04-07 16:33:27'),
('ea82d413-80ca-4163-b30e-1448ab4a9560', '76c439ef-5482-4b79-8398-26173dfc94c8', 'New Incident Pending', 'A new behavior record has been logged and requires your review.', 'incident', '32f23148-8f6e-4cb6-bb67-a230e17010cc', 1, '2026-04-07 13:06:21');

-- --------------------------------------------------------

--
-- Table structure for table `parents`
--

CREATE TABLE `parents` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `address` text DEFAULT NULL,
  `emergency_contact` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` varchar(36) NOT NULL,
  `admission_number` varchar(50) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `parent_phone` varchar(20) NOT NULL,
  `class_id` varchar(36) DEFAULT NULL,
  `photo_url` varchar(255) NOT NULL,
  `current_points` int(11) DEFAULT 0,
  `registered_by` varchar(36) DEFAULT NULL,
  `status` enum('active','withdrawn','graduated') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `admission_number`, `first_name`, `last_name`, `date_of_birth`, `gender`, `parent_phone`, `class_id`, `photo_url`, `current_points`, `registered_by`, `status`, `created_at`, `updated_at`) VALUES
('02ceab15-80e7-4a8e-a87f-b09685005f53', '465', 'nuru', 'endris', '2026-04-07', 'male', '', '5ccf5b6e-a772-4dee-89db-8894021c862b', '/uploads/students/student-1775547268140.png', -50, '76c439ef-5482-4b79-8398-26173dfc94c8', 'active', '2026-04-07 10:34:28', '2026-04-07 16:30:48'),
('24fe0951-aad4-40af-901f-a8572cddc9f7', 'AM/9A/009', 'Hareem', 'Mohammed Abdella', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Hareem+Mohammed Abdella&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('359659f7-8787-4bb7-b2c7-ebb3fe0ced27', 'AM/9A/016', 'Newara', 'Jafar Abamecha', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Newara+Jafar Abamecha&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('3c5b8881-5b4c-44ab-92bf-597d448ee838', 'AM/9A/023', 'Zekerya', 'Seid Ayub', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Zekerya+Seid Ayub&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('3e197681-1721-4030-bfde-afda519313fb', 'AM/9B/001', 'Abdullah ', 'DoeFethi Abdullahi', '2010-05-15', 'male', '0911223344', '5ccf5b6e-a772-4dee-89db-8894021c862b', '/uploads/students/default.png', 0, '977b1540-332d-428e-a62a-666684a726d9', 'active', '2026-04-07 17:37:39', '2026-04-07 17:37:39'),
('3e4f368e-1338-4242-8ecb-1ba87a23d625', 'AM/9A/008', 'Hanifa', 'Said Ahmed', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Hanifa+Said Ahmed&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('3f650d41-ea69-4ffa-ab31-d3aea7f57ce5', 'AM/9A/011', 'Mohammed', 'Abdulwehab Abdurahman', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Mohammed+Abdulwehab Abdurahman&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('5288cf00-5052-496b-a0b7-b630d46be581', 'AM/9A/002', 'Aya', 'Nurhussen Taha', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Aya+Nurhussen Taha&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('5b05f387-a7f0-47e1-9187-f6d3a2efd43a', 'AM/9A/004', 'Eman', 'Jemal Awol', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Eman+Jemal Awol&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('5d826244-4173-4bbc-8fef-233ac1a7e273', 'AM/9B/002', 'Adil ', 'SmithYusuf Getachew', '2011-08-20', 'female', '0922334455', '5ccf5b6e-a772-4dee-89db-8894021c862b', '/uploads/students/default.png', 0, '977b1540-332d-428e-a62a-666684a726d9', 'active', '2026-04-07 17:37:39', '2026-04-07 17:37:39'),
('66edd5a3-3591-49f5-8f54-4f69d3c77b6a', 'AM/9A/007', 'Hanif', 'Nejmudin Ahmed', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Hanif+Nejmudin Ahmed&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('7d3c7f66-9d1e-4b3c-9f19-904311233dae', 'AM/9A/017', 'Nurhan', 'Ayub Getachew', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Nurhan+Ayub Getachew&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('841dd82d-fd9d-4736-88da-c80fd7556d3b', 'ST-001', 'Samuel', 'Tola', NULL, 'male', '', '5ccf5b6e-a772-4dee-89db-8894021c862b', 'https://placehold.co/400x400?text=Samuel', 0, '977b1540-332d-428e-a62a-666684a726d9', 'active', '2026-04-06 18:10:22', '2026-04-06 18:10:22'),
('92a84e86-3955-4fd6-945a-0face31032be', 'AM/9A/001', 'Ameterhman', 'Oumer Kassahun', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Ameterhman+Oumer Kassahun&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('9b1e73ac-a27e-4c77-a1a1-7b6c5ab65c06', 'AM/9A/020', 'Sebrina', 'Neja Wudmatas', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Sebrina+Neja Wudmatas&background=random&color=fff&size=512', -30, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 16:33:27'),
('a322092c-b5db-419a-9760-605bc308a01e', 'AM/9A/014', 'Muhammed', 'Mustepha Seid', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Muhammed+Mustepha Seid&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('a3a501a8-af04-4f27-b522-abfd66975dc1', 'AM/9A/006', 'Hanan', 'Ahmedin Redi', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Hanan+Ahmedin Redi&background=random&color=fff&size=512', 20, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 16:29:19'),
('a8679416-b871-4d94-bce4-5e691f9584a6', 'AM/9A/015', 'Nebil', 'Abdulwahid Yasin', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Nebil+Abdulwahid Yasin&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('ac8704c5-e210-4bd4-8df3-a47ef75780aa', 'AM/9A/022', 'Wildan', 'Mohammed Osman', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Wildan+Mohammed Osman&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('b9e38419-0e91-49d9-a8b6-7967b1b63771', 'AM/9A/005', 'Eneb', 'Mohammednur Redwan', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Eneb+Mohammednur Redwan&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('be56414a-69a6-4c5a-8234-0ae1ea348285', 'AM/9A/018', 'Obaid', 'Ibrahim Hassen', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Obaid+Ibrahim Hassen&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('c5d47f8c-e6ed-4672-9783-603d24b1fa07', 'AM/9A/021', 'Sumeya', 'Mohammed Basha', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Sumeya+Mohammed Basha&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('d4b9924d-9a3b-44ce-b458-5b451d5de407', 'AM/9A/012', 'Mohammed', 'Kalied Mohammed', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Mohammed+Kalied Mohammed&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('e32faf42-368c-45da-80d8-f30b5a654ca3', 'AM/9A/010', 'Mahmud', 'Bekri Mohammed', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Mahmud+Bekri Mohammed&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('e4bfb982-a5b5-42ca-8b5a-1f650af95bc5', 'AM/9A/003', 'Elham', 'Abduljelil Reshad', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Elham+Abduljelil Reshad&background=random&color=fff&size=512', 40, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 16:25:16'),
('eea4e66d-d839-4e33-a040-bf5cae1f2536', 'AM/9A/013', 'Mohammed', 'Mustefa Ahmedin', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Mohammed+Mustefa Ahmedin&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59'),
('fe102510-6bf8-4b57-a42b-b926ff8b32d3', 'AM/9A/019', 'Ousman', 'Mohialdin Ousman', NULL, NULL, '', '230cbff8-abde-4e17-8345-959fcf85c572', 'https://ui-avatars.com/api/?name=Ousman+Mohialdin Ousman&background=random&color=fff&size=512', 0, NULL, 'active', '2026-04-07 13:02:59', '2026-04-07 13:02:59');

-- --------------------------------------------------------

--
-- Table structure for table `student_parents`
--

CREATE TABLE `student_parents` (
  `student_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` varchar(255) NOT NULL,
  `teacher_id` varchar(255) DEFAULT NULL,
  `class_id` varchar(255) DEFAULT NULL,
  `subject_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('officer','teacher','supervisor','manager','parent') NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `reset_token` varchar(255) NOT NULL,
  `reset_token_expiry` datetime(6) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `phone`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `profile_picture`, `is_active`, `reset_token`, `reset_token_expiry`, `last_login`, `created_at`, `updated_at`) VALUES
('189fd30a-7c3e-4e9b-b3f7-03dc5f91cd9c', '0955555555', 'test@amss.com', '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'manager', 'abebe', 'manager', NULL, 1, '155560', '2026-04-07 15:27:52.031000', NULL, '2026-04-07 10:46:39', '2026-04-07 18:15:26'),
('285fb585-5fab-412b-a80e-fdd93cab447e', '0988288858', 'nuru.endriscs@gmail.com', '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'teacher', 'ahmed', 'abebe', NULL, 1, '', '0000-00-00 00:00:00.000000', NULL, '2026-04-07 16:57:04', '2026-04-07 18:15:26'),
('76c439ef-5482-4b79-8398-26173dfc94c8', '0900000000', NULL, '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'supervisor', 'Admin', 'Supervisor', NULL, 1, '', '0000-00-00 00:00:00.000000', NULL, '2026-04-06 18:10:22', '2026-04-07 18:15:26'),
('7be5342b-35bd-4b93-93fc-5176c47aaa3e', '0933333333', NULL, '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'parent', 'Lensa', 'Tola', NULL, 1, '', '0000-00-00 00:00:00.000000', NULL, '2026-04-06 18:10:22', '2026-04-07 18:15:26'),
('80b9eb11-c9dd-4771-8b7a-96ecccd30f44', '0913912388', 'nuruendris@kiot.edu.et', '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'teacher', 'Nuru', 'Endrs', NULL, 1, '893943', '2026-04-07 15:33:55.563000', NULL, '2026-04-06 18:10:22', '2026-04-07 18:15:26'),
('977b1540-332d-428e-a62a-666684a726d9', '0911111111', NULL, '$2b$10$ELKurVfRs4ubQLcoBbPhIeNkcB2yGLcomH0dp2hhQShPEAMejZEai', 'officer', 'School', 'Officer', NULL, 1, '', '0000-00-00 00:00:00.000000', NULL, '2026-04-06 18:10:22', '2026-04-07 18:15:26');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `behavior_categories`
--
ALTER TABLE `behavior_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `behavior_records`
--
ALTER TABLE `behavior_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `grade_level` (`grade_level`,`section`,`academic_year`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `interventions`
--
ALTER TABLE `interventions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `behavior_id` (`behavior_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admission_number` (`admission_number`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `registered_by` (`registered_by`);

--
-- Indexes for table `student_parents`
--
ALTER TABLE `student_parents`
  ADD PRIMARY KEY (`student_id`,`parent_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `behavior_records`
--
ALTER TABLE `behavior_records`
  ADD CONSTRAINT `behavior_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `behavior_records_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `behavior_categories` (`id`),
  ADD CONSTRAINT `behavior_records_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `behavior_records_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `interventions`
--
ALTER TABLE `interventions`
  ADD CONSTRAINT `interventions_ibfk_1` FOREIGN KEY (`behavior_id`) REFERENCES `behavior_records` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `interventions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`registered_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_parents`
--
ALTER TABLE `student_parents`
  ADD CONSTRAINT `student_parents_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_parents_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
