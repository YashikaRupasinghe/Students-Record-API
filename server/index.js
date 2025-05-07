const express = require('express');
const { router: metricsRouter, updateStudentCount } = require('./metrics');
const app = express();
app.use(express.json());

let students = [];
let idCounter = 1;

function refreshMetrics() {
  updateStudentCount(students.length);
}

app.get('/students', (req, res) => {
  res.json(students);
});

app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/students', (req, res) => {
  const { name, age, address } = req.body;
  const newStudent = { id: idCounter++, name, age, address };
  students.push(newStudent);
  refreshMetrics(); // update metrics after change
  res.status(201).json(newStudent);
});

app.put('/students/:id', (req, res) => {
  const { name, age, address } = req.body;
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) return res.status(404).json({ error: 'Student not found' });

  student.name = name;
  student.age = age;
  student.address = address;
  res.json(student);
});

app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  students.splice(index, 1);
  refreshMetrics(); // update metrics after delete
  res.status(204).send();
});

// Use metrics route at /metrics
app.use('/metrics', metricsRouter);

app.listen(3000, () => {
  console.log('Student Records API running on port 3000');
});
