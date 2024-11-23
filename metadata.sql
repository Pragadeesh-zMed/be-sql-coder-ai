CREATE TABLE `PATIENTS` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `visited_date` date DEFAULT NULL
);
CREATE TABLE `ALLERGIES` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `allergy` varchar(50) DEFAULT NULL
);
CREATE TABLE `PATIENT_EXAMINATION` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `examination_recorded_date` date DEFAULT NULL,
  `position_during_surgery` text
);
CREATE TABLE `PROGRESS_NOTES` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `date` date DEFAULT NULL,
  `notes` text
)
CREATE TABLE `SURGERY_INFO` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `surgery_start_date` date DEFAULT NULL,
  `surgery_end_date` date DEFAULT NULL,
  `position_during_surgery` text,
  `incision_or_procedure_details` text,
  `procedure_or_surgery_performed` text,
  `type_of_closure_used_for_incision` text,
  `drainage_during_surgery` text,
  `estimated_blood_loss_during_surgery` text,
  `specimen_collected_during_surgery` text,
  `post_operative_instructions_provided` text,
  `surgical_description_1` text,
  `surgical_description_2` text
);
CREATE TABLE `LAB_REPORTS` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `group_test_name` text,
  `test_name` text,
  `value` text,
  `unit` varchar(20) DEFAULT NULL,
  `sample_collected_date` date DEFAULT NULL,
  `sample_collected_branch` text
);
CREATE TABLE `RADIOLOGY_REPORTS` (
  `patient_medical_record_number` bigint DEFAULT NULL,
  `patient_visit_id` bigint DEFAULT NULL,
  `radiology_service_description` text,
  `date_when_radiology_data_added` date DEFAULT NULL,
  `comments_by_doctor` text,
  `comments_by_radiographer` text,
  `comments_by_radiologist` text,
  `title_of_radiology_report` text,
  `clinical_info_of_radiology_service` text,
  `impression_on_radiology_test_result` text
);