// Test script to verify API connectivity
async function testAPI() {
    try {
        console.log('Testing API connection to http://localhost:8000/api/auth/register');

        const response = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test123@example.com',
                password: 'testpassword123',
                full_name: 'Test User'
            })
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        const data = await response.json();
        console.log('Response data:', data);

    } catch (error) {
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
}

testAPI();
