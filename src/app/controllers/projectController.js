const express = require("express");
const authMiddleware = require("../middlewares/auth");

const Project = require('../models/project');
const Task = require('../models/taks');

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate(['user', 'tasks']);

    return res.send({ projects });
  } catch (err) {
    return res.status(400).send({ error: 'Erro na listagem dos projetos' });
  }
});

router.get("/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Erro na listagem do projeto' });
  }
});

router.post('/', async (req, res) => {
  try {

    const { title, description, tasks } = req.body;

    const project = await Project.create({ title, description, user: req.userId });

    await Promise.all(tasks.map(async task => {
      const projectTask = new Task({ ...task, project: project._id });

      await projectTask.save();

      project.tasks.push(projectTask);
    }));

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Erro na criação do projeto' });
  }
});

router.put('/:projectId', async (req, res) => {
  try {

    const { title, description, tasks } = req.body;

    const project = await Project.findByIdAndUpdate(req.params.projectId, { title, description }, { new: true });

    project.task = [];
    await Task.remove({ project: project._id });

    await Promise.all(tasks.map(async task => {
      const projectTask = new Task({ ...task, project: project._id });

      await projectTask.save();

      project.tasks.push(projectTask);
    }));

    await project.save();

    return res.send({ project });
  } catch (err) {
    return res.status(400).send({ error: 'Erro na alteração do projeto' });
  }
});

router.delete('/:projectId', async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId);

    return res.send();
  } catch (err) {
    return res.status(400).send({ error: 'Erro na exclusão do projeto' });
  }
});

module.exports = app => app.use("/projects", router);