const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'databased',
});

db.connect();

app.post('/loginrequest', (req, res) => {
    const { username, password, isAdmin } = req.body;
    
    let sql;
    let params;
  
    if (isAdmin) {
      // If admin checkbox is checked, verify against the admin table
      sql = 'SELECT * FROM admin WHERE USERNAME = ? AND PASSWORD = ?';
      params = [username, password];
      
    } else {
      // Otherwise, verify against the student table
      sql = 'SELECT * FROM student WHERE USERNAME = ? AND PASSWORD = ?';
      params = [username, password];
    }
  
    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else if (result.length > 0) {
        res.json({ success: true, message: 'success' });
      } else {
        res.json({ success: false, message: 'fail' });
      }
    });
  });
// Add this route to your server.js
app.get('/facultyRatingsAndReviews', (req, res) => {
    const sql = `
        SELECT 
            f.ID, f.NAME, f.SUBJECT,
            AVG(r.RATING) AS AVERAGE_RATING,
            GROUP_CONCAT(r.REVIEW) AS REVIEWS
        FROM faculty f
        LEFT JOIN review r ON f.ID = r.FACULTYID
        GROUP BY f.ID, f.NAME, f.SUBJECT
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching faculty ratings and reviews:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result);
        }
    });
});





app.post('/submitFeedback', (req, res) => {
    const { studentName, facultyId, averageRating, textReview } = req.body;
  
    const sql = 'INSERT INTO review (Studentname, facultyid, rating, review) VALUES (?, ?, ?, ?)';
    db.query(sql, [studentName, facultyId, averageRating, textReview], (err, result) => {
      if (err) {
        console.error('Error submitting feedback:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json({ success: true, message: 'Feedback submitted successfully' });
      }
    });
  });
app.get('/faculties', (req, res) => {
    const sql = 'SELECT ID, CONCAT(NAME, " - ", SUBJECT) AS FACULTY_SUBJECT FROM Faculty';
    db.query(sql, (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result);
      }
    });
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
