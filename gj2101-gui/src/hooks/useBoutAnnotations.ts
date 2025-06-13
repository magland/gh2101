import { useState, useEffect, useMemo } from 'react';
import { BoutTag } from '../types';

export const useBoutAnnotations = (baseUrl: string, csvUrl: string) => {
    const [tags, setTags] = useState<BoutTag[]>([]);

    const getStorageKey = useMemo(() => (() => `bout_annotations_${baseUrl}_${csvUrl}`), [baseUrl, csvUrl]);

    useEffect(() => {
        const storageKey = getStorageKey();
        const storedData = localStorage.getItem(storageKey);
        if (storedData) {
            const allTags = JSON.parse(storedData).tags;
            setTags(allTags);
        } else {
            setTags([]);
        }
    }, [getStorageKey]);

    const saveTags = (newTags: BoutTag[]) => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify({ tags: newTags }));
    };

    const addTag = (boutId: number, tagName: string) => {
        const newTag: BoutTag = { bout: boutId, name: tagName };
        const newTags = [...tags, newTag];
        setTags(newTags);
        saveTags(newTags);
    };

    const removeTag = (boutId: number, tagName: string) => {
        const newTags = tags.filter(tag =>
            !(tag.bout === boutId && tag.name === tagName)
        );
        setTags(newTags);
        saveTags(newTags);
    };

    const getTagsForBout = (boutId: number): string[] => {
        return tags
            .filter(tag => tag.bout === boutId)
            .map(tag => tag.name);
    };

    const clearAllTags = () => {
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify({ tags: [] }));
        setTags([]);
    };

    return {
        addTag,
        removeTag,
        getTagsForBout,
        tags,
        setTags,
        clearAllTags
    };
};
