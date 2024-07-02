-- Create tables
CREATE TABLE Department (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE Employee (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    departmentId INT REFERENCES Department(id),
    age INT NOT NULL,
    hire_date DATE NOT NULL
);

CREATE TABLE Salary (
    id SERIAL PRIMARY KEY,
    employeeId INT REFERENCES Employee(id),
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL
);

-- Insert random departments
INSERT INTO Department (name, location)
SELECT
    'Department ' || i,
    'Location ' || i
FROM generate_series(1, 20) AS s(i);

-- Arrays of sample first and last names
DO $$
DECLARE
    first_names TEXT[] := ARRAY['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Michael', 'Sarah', 'David', 'Laura'];
    last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
    emp_id INT;
    random_first_name TEXT;
    random_last_name TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        -- Select random first and last names
        random_first_name := first_names[FLOOR(RANDOM() * ARRAY_LENGTH(first_names, 1) + 1)];
        random_last_name := last_names[FLOOR(RANDOM() * ARRAY_LENGTH(last_names, 1) + 1)];

        -- Insert random employee
        INSERT INTO Employee (name, departmentId, age, hire_date)
        VALUES (
            random_first_name || ' ' || random_last_name,
            (SELECT id FROM Department ORDER BY RANDOM() LIMIT 1),
            (RANDOM() * (65 - 18) + 18)::INT,
            CURRENT_DATE - (RANDOM() * 3650)::INT
        )
        RETURNING id INTO emp_id;

        -- Insert random salary
        INSERT INTO Salary (employeeId, amount, date)
        SELECT emp_id, (RANDOM() * 50000 + 30000), CURRENT_DATE - (RANDOM() * 3650)::INT;
    END LOOP;
END $$;
