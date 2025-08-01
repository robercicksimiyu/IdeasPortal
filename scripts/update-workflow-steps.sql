-- Migrate existing API_PROMOTER_REVIEW steps to IDEAS_COMMITTEE_REVIEW
UPDATE workflow_steps
SET step_name = 'IDEAS_COMMITTEE_REVIEW'
WHERE step_name = 'API_PROMOTER_REVIEW';

-- Update any ideas table references if they exist
UPDATE ideas
SET current_step = 'IDEAS_COMMITTEE_REVIEW'
WHERE current_step = 'API_PROMOTER_REVIEW';
