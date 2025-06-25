import { useState, useEffect, useMemo } from 'react';
import { BoutTag, BoutNote } from '../types';

export const useBoutAnnotations = (baseUrl: string, csvUrl: string) => {
    const [tags, setTags] = useState<BoutTag[]>([]);
    const [notes, setNotes] = useState<BoutNote[]>([]);

    const getStorageKey = useMemo(() => (() => `bout_annotations_${baseUrl}_${csvUrl}`), [baseUrl, csvUrl]);

    useEffect(() => {
        const storageKey = getStorageKey();
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const data = JSON.parse(storedData);
            setTags(data.tags || []);
            setNotes(data.notes || []);
        } else {
            setTags([]);
            setNotes([]);
        }
    }, [getStorageKey]);

    const saveData = (newTags: BoutTag[], newNotes: BoutNote[]) => {
        const storageKey = getStorageKey();
        const data: { tags: BoutTag[]; notes?: BoutNote[] } = { tags: newTags };
        if (newNotes.length > 0) {
            data.notes = newNotes;
        }
        localStorage.setItem(storageKey, JSON.stringify(data));
    };

    const addTag = (boutId: number, tagName: string) => {
        const newTag: BoutTag = { bout: boutId, name: tagName };
        const newTags = [...tags, newTag];
        setTags(newTags);
        saveData(newTags, notes);
    };

    const removeTag = (boutId: number, tagName: string) => {
        const newTags = tags.filter(tag =>
            !(tag.bout === boutId && tag.name === tagName)
        );
        setTags(newTags);
        saveData(newTags, notes);
    };

    const getTagsForBout = (boutId: number): string[] => {
        return tags
            .filter(tag => tag.bout === boutId)
            .map(tag => tag.name);
    };

    const setNote = (boutId: number, noteText: string) => {
        const existingNoteIndex = notes.findIndex(note => note.bout === boutId);
        let newNotes: BoutNote[];

        if (noteText.trim() === '') {
            // Remove note if empty
            newNotes = notes.filter(note => note.bout !== boutId);
        } else {
            // Add or update note
            const newNote: BoutNote = { bout: boutId, note: noteText };
            if (existingNoteIndex >= 0) {
                newNotes = [...notes];
                newNotes[existingNoteIndex] = newNote;
            } else {
                newNotes = [...notes, newNote];
            }
        }

        setNotes(newNotes);
        saveData(tags, newNotes);
    };

    const getNoteForBout = (boutId: number): string | undefined => {
        const note = notes.find(note => note.bout === boutId);
        return note?.note;
    };

    const removeNote = (boutId: number) => {
        const newNotes = notes.filter(note => note.bout !== boutId);
        setNotes(newNotes);
        saveData(tags, newNotes);
    };

    const clearAllTags = () => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify({ tags: [] }));
        setTags([]);
        setNotes([]);
    };

    const getAllUniqueTagNames = (): string[] => {
        const uniqueNames = new Set(tags.map(tag => tag.name));
        return Array.from(uniqueNames).sort();
    };

    return {
        addTag,
        removeTag,
        getTagsForBout,
        tags,
        setTags,
        clearAllTags,
        setNote,
        getNoteForBout,
        removeNote,
        notes,
        setNotes,
        getAllUniqueTagNames
    };
};
