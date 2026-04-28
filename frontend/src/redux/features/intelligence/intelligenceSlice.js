import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeSegment: 'All',
    activeRegion: 'All'
};

const intelligenceSlice = createSlice({
    name: 'intelligence',
    initialState,
    reducers: {
        setActiveSegment: (state, action) => {
            state.activeSegment = action.payload;
        },
        setActiveRegion: (state, action) => {
            state.activeRegion = action.payload;
        },
        resetFilters: (state) => {
            state.activeSegment = 'All';
            state.activeRegion = 'All';
        }
    }
});

export const { setActiveSegment, setActiveRegion, resetFilters } = intelligenceSlice.actions;
export default intelligenceSlice.reducer;
