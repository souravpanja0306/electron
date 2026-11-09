"use strict";
const express = require("express");
const router = express.Router();
const middleware = require("../middleware/middleware");
const NoteController = require("../controller/note.controller");

const auth = middleware.isAuthenticated;
router.get("/generate-note-no", auth, NoteController.generateNoteNo);
router.post("/note-create", auth, NoteController.createNote);
router.get("/note-list", auth, NoteController.getNotes);
router.put("/note-update", auth, NoteController.updateNote);
router.delete("/note-delete/:id", auth, NoteController.deleteNote);
router.get("/generate-note-pdf", auth, NoteController.generateNotePdf);

module.exports = router;
