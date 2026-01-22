
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = "https://jeqotvuzlygdrexfduct.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcW90dnV6bHlnZHJleGZkdWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjEyMzQsImV4cCI6MjA4NDA5NzIzNH0.YNYg5z9OyYpJT1ISKHDsUMkCvRxhvEyryi0072h-SH4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    let output = `Testing connection to: ${SUPABASE_URL}\n`;

    // 1. Try to fetch courses without instructor relation
    output += "--- Fetching Courses (Simple) ---\n";
    const { data: courses, error } = await supabase.from('courses').select('*');
    if (error) {
        output += `Error fetching courses: ${JSON.stringify(error)}\n`;
    } else {
        output += `Success! Found ${courses.length} courses.\n`;
        if (courses.length > 0) output += `Sample: ${JSON.stringify(courses[0])}\n`;
    }

    // 2. Try to fetch courses with instructor (checking relation)
    output += "\n--- Fetching Courses with Instructor ---\n";
    const { data: coursesWithInst, error: instError } = await supabase.from('courses').select('*, instructor:profiles(*)');
    if (instError) {
        output += `Error fetching with instructor: ${instError.message}\n`;
    } else {
        output += "Success fetching with instructor!\n";
    }

    fs.writeFileSync('test_result.txt', output);
    console.log("Done");
}

test();
