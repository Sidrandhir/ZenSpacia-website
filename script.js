// Waitlist Form Submission
document.getElementById('waitlist-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    alert(`Thank you, ${name}! You've joined the ZenSpacia waitlist with ${email}.`);
    this.reset(); // Clear form
});