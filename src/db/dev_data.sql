-- Sample data for items table (folders and files)

-- Create root-level folders
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('Projects', 'folder', NULL, NULL, NULL, 'John Doe', '2026-01-01 09:00:00', '2026-01-01 09:00:00'),
('Reports', 'folder', NULL, NULL, NULL, 'Jane Smith', '2026-01-01 09:15:00', '2026-01-01 09:15:00'),
('Archive', 'folder', NULL, NULL, NULL, 'Admin', '2026-01-01 09:30:00', '2026-01-01 09:30:00');

-- Create 3 files at root level (parent_id=NULL)
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('Employee Handbook.pdf', 'file', NULL, 512, 'https://s3.amazonaws.com/my-doc-bucket/docs/employee-handbook.pdf', 'HR', '2025-12-15 10:00:00', '2025-12-15 10:00:00'),
('Meeting Notes - Jan 2026.docx', 'file', NULL, 48, 'https://s3.amazonaws.com/my-doc-bucket/docs/meeting-notes-jan-2026.docx', 'Alice Wong', '2026-01-09 11:15:00', '2026-01-09 11:15:00'),
('Marketing Plan 2026.pptx', 'file', NULL, 768, 'https://s3.amazonaws.com/my-doc-bucket/docs/marketing-plan-2026.pptx', 'Marketing', '2025-12-28 15:30:00', '2026-01-04 11:00:00');

-- Create files in "Projects" folder (parent_id=1)
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('Project Proposal 2026.pdf', 'file', 1, 245, 'https://s3.amazonaws.com/my-doc-bucket/docs/project-proposal-2026.pdf', 'John Doe', '2026-01-05 09:30:00', '2026-01-05 09:30:00'),
('System Architecture Diagram.png', 'file', 1, 2048, 'https://s3.amazonaws.com/my-doc-bucket/docs/system-architecture.png', 'Bob Lee', '2026-01-02 13:45:00', '2026-01-06 09:20:00');

-- Create files in "Reports" folder (parent_id=2)
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('Q4 Financial Report.xlsx', 'file', 2, 1024, 'https://s3.amazonaws.com/my-doc-bucket/docs/q4-financial-report.xlsx', 'Jane Smith', '2026-01-03 14:20:00', '2026-01-08 16:45:00'),
('Customer Feedback Summary.xlsx', 'file', 2, 128, 'https://s3.amazonaws.com/my-doc-bucket/docs/customer-feedback-summary.xlsx', 'Support', '2026-01-08 16:00:00', '2026-01-08 16:00:00');

-- Create nested folder structure: Archive -> 2025 -> Q4
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('2025', 'folder', 3, NULL, NULL, 'Admin', '2026-01-01 10:00:00', '2026-01-01 10:00:00'),
('Q4', 'folder', 11, NULL, NULL, 'Admin', '2026-01-01 10:15:00', '2026-01-01 10:15:00');

-- Create file in the deepest nested folder (Q4, parent_id=5)
INSERT INTO items (title, item_type, parent_id, file_size_kb, s3_url, created_by, created_at, updated_at) VALUES
('Deprecated Policy Document.pdf', 'file', 12, 92, 'https://s3.amazonaws.com/my-doc-bucket/docs/deprecated-policy.pdf', 'Admin', '2025-10-10 09:00:00', '2025-12-31 23:59:00');
