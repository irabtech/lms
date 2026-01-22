
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = "https://jeqotvuzlygdrexfduct.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcW90dnV6bHlnZHJleGZkdWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjEyMzQsImV4cCI6MjA4NDA5NzIzNH0.YNYg5z9OyYpJT1ISKHDsUMkCvRxhvEyryi0072h-SH4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    let output = `Testing connection to: ${SUPABASE_URL}\n`;

    // 1. Fetch ALL courses without any filters to see what exists in DB
    output += "\n--- Fetching ALL Courses (Raw) ---\n";
    const { data: allCourses, error: allError } = await supabase.from('courses').select('*');
    if (allError) {
        output += `Error fetching all courses: ${allError.message}\n`;
    } else {
        output += `Total Courses in DB: ${allCourses.length}\n`;
        allCourses.forEach(c => {
            output += `- [${c.id}] ${c.title} (Published: ${c.is_published}, Instructor: ${c.instructor_id})\n`;
        });
    }

    // 2. Mock 'get enrollments' logic
    output += "\n--- Enrollment Logic Test ---\n";
    // We can't easily test auth-dependent RLS without a user token, 
    // but we can check if the 'enrollments' table is accessible generally or if it has public rows.
    // Ideally we'd need a valid access token here.
    const { data: publicEnrollments, error: enrollError } = await supabase.from('enrollments').select('*').limit(5);
    if (enrollError) {
        output += `Error fetching enrollments: ${enrollError.message}\n`;
    } else {
        output += `Visible Enrollments (Anonymous): ${publicEnrollments.length}\n`;
    }

    fs.writeFileSync('test_debug.txt', output);
    console.log("Done");
}

test();
