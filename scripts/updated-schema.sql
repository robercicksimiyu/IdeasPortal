-- Updated Ideas Portal Database Schema with proper workflow support
-- Drop existing tables if they exist
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS idea_comments CASCADE;
DROP TABLE IF EXISTS ideas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (populated from Zoho SSO)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    zoho_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Initiator',
    department VARCHAR(100),
    country VARCHAR(100),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table with enhanced workflow support
CREATE TABLE ideas (
    id SERIAL PRIMARY KEY,
    idea_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    workflow_version VARCHAR(10) NOT NULL DEFAULT 'v1',
    expected_benefit TEXT,
    implementation_effort TEXT,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Submitted',
    current_step VARCHAR(100) DEFAULT 'API_PROMOTER_REVIEW',
    vote_count INTEGER DEFAULT 0,
    submitter_id INTEGER REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps tracking
CREATE TABLE workflow_steps (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    assigned_role VARCHAR(100) NOT NULL,
    assigned_user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending',
    action_taken VARCHAR(100),
    comments TEXT,
    score INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments and reviews
CREATE TABLE idea_comments (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications log
CREATE TABLE email_notifications (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_ideas_submitter ON ideas(submitter_id);
CREATE INDEX idx_ideas_status ON ideas(status);
CREATE INDEX idx_ideas_current_step ON ideas(current_step);
CREATE INDEX idx_workflow_steps_idea ON workflow_steps(idea_id);
CREATE INDEX idx_workflow_steps_assigned_user ON workflow_steps(assigned_user_id);
CREATE INDEX idx_users_zoho_id ON users(zoho_id);
CREATE INDEX idx_users_role ON users(role);

-- Insert admin user
INSERT INTO users (zoho_id, email, name, role, is_admin) VALUES 
('admin_zoho_id', 'admin@company.com', 'System Admin', 'Admin', TRUE);
