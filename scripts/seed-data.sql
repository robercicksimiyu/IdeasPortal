-- Seed data for Ideas Portal
-- This script populates the database with sample data for testing

-- Insert sample users
INSERT INTO users (email, name, role, department, country) VALUES
('john.doe@company.com', 'John Doe', 'Initiator', 'Engineering', 'USA'),
('jane.smith@company.com', 'Jane Smith', 'API Promoter', 'IT', 'USA'),
('mike.johnson@company.com', 'Mike Johnson', 'Ideas Committee', 'Management', 'UK'),
('sarah.wilson@company.com', 'Sarah Wilson', 'Line Executive', 'Executive', 'Canada'),
('alex.chen@company.com', 'Alex Chen', 'Business Unit Manager', 'Operations', 'Australia'),
('emma.thompson@company.com', 'Emma Thompson', 'API Team', 'IT', 'UK'),
('david.brown@company.com', 'David Brown', 'Divisional Committee', 'Management', 'Germany');

-- Insert sample ideas
INSERT INTO ideas (idea_number, subject, description, country, department, workflow_version, expected_benefit, implementation_effort, priority, status, submitter_id) VALUES
('ID-001', 'Improve customer onboarding process', 'Streamline the customer onboarding process by creating automated workflows and reducing manual touchpoints.', 'USA', 'Customer Success', 'v1', 'Reduce onboarding time by 50% and improve customer satisfaction', 'Medium - requires 2-3 developers for 1 month', 'High', 'Pending Review', 1),
('ID-002', 'Automate invoice processing', 'Implement automated invoice processing system to reduce manual data entry and improve accuracy.', 'UK', 'Finance', 'v2', 'Save 20 hours per week of manual work and reduce errors by 90%', 'High - requires integration with existing ERP system', 'Medium', 'Committee Review', 1),
('ID-003', 'Enhanced mobile app performance', 'Optimize mobile application performance by implementing caching strategies and reducing API calls.', 'Canada', 'Engineering', 'v1', 'Improve app loading time by 40% and reduce server costs', 'Low - optimization work by existing team', 'High', 'Approved', 1),
('ID-004', 'Streamline HR recruitment process', 'Create a centralized recruitment dashboard with automated candidate screening and interview scheduling.', 'Australia', 'Human Resources', 'v2', 'Reduce time-to-hire by 30% and improve candidate experience', 'Medium - requires new recruitment software', 'Low', 'Implementation', 1);

-- Insert workflow steps
INSERT INTO workflow_steps (idea_id, step_name, assigned_role, status, comments) VALUES
(1, 'Initial Review', 'API Promoter', 'Pending', NULL),
(2, 'Committee Scoring', 'Ideas Committee', 'In Progress', 'Initial review completed, scoring in progress'),
(3, 'Implementation', 'Initiator', 'Completed', 'Successfully implemented and deployed'),
(4, 'BUM Assignment', 'Business Unit Manager', 'In Progress', 'Implementation plan being developed');

-- Insert sample comments
INSERT INTO idea_comments (idea_id, user_id, comment, comment_type) VALUES
(1, 2, 'This idea has strong potential. Need to review technical feasibility.', 'review'),
(2, 3, 'Excellent proposal. Score: 8/10. Recommend for implementation.', 'scoring'),
(3, 1, 'Implementation completed successfully. Performance improvements verified.', 'update'),
(4, 5, 'Working on implementation timeline. Expected completion in 6 weeks.', 'progress');
