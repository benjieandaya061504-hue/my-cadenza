-- Insert sample instructors into the instructors table
-- Run this in your MySQL database (phpMyAdmin, MySQL Workbench, or CLI)

INSERT INTO instructors (first_name, last_name, email, contact_number, address, specialization, bio) VALUES
('Mark', 'Reyes', 'mark.reyes@cadenza.com', '09171234501', '123 Guitar St., Manila', 'Guitar, Drums', 'Guitar & Drums specialist with 10 years experience'),
('Anna', 'Santos', 'anna.santos@cadenza.com', '09171234502', '456 Piano Ave., Quezon City', 'Piano, Violin', 'Piano & Violin instructor, classically trained'),
('Carlo', 'Mendoza', 'carlo.mendoza@cadenza.com', '09171234503', '789 Saxophone Rd., Makati', 'Saxophone, Woodwinds', 'Saxophone & Woodwinds expert'),
('Sofia', 'Gomez', 'sofia.gomez@cadenza.com', '09171234504', '321 Keyboard Blvd., Pasig', 'Keyboard, Music Theory', 'Keyboard & Music Theory instructor'),
('Pedro', 'Gonzales', 'pedro.gonzales@cadenza.com', '09171234505', '555 Piano St., Mandaluyong', 'Piano', 'Senior instructor for piano with 15 years experience'),
('Carlos', 'Fernandez', 'carlos.fernandez@cadenza.com', '09171234506', '777 Voice Ave., Taguig', 'Guitar, Voice', 'Guitar and voice instructor');

-- Verify the inserted data
SELECT * FROM instructors;