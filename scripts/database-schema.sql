-- Ideas Portal Database Schema
-- This script creates the necessary tables for the Ideas Portal application

-- Users table (will be populated from Zoho SSO)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
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
    vote_count INTEGER DEFAULT 0,
    submitter_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id),
    step_name VARCHAR(100) NOT NULL,
    assigned_role VARCHAR(100) NOT NULL,
    assigned_user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending',
    comments TEXT,
    score INTEGER,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments/Reviews table
CREATE TABLE IF NOT EXISTS idea_comments (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id),
    user_id INTEGER REFERENCES users(id),
    comment TEXT NOT NULL,
    comment_type VARCHAR(50) DEFAULT 'review',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    idea_id INTEGER REFERENCES ideas(id),
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_submitter ON ideas(submitter_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_workflow_version ON ideas(workflow_version);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_idea ON workflow_steps(idea_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_assigned_user ON workflow_steps(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
