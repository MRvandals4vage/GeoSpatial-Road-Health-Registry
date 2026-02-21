/**
 * Utility helpers for road‑related display formatting.
 * Keeping these in a dedicated file avoids duplication across panels.
 */
import type { RoadCondition } from '../types/road';

export const formatCondition = (cond: RoadCondition): string => {
    switch (cond) {
        case 'GOOD':
            return 'Good';
        case 'MODERATE':
            return 'Moderate';
        case 'SEVERE':
            return 'Severe';
        default:
            return cond;
    }
};

export const formatScore = (score: number): string => `${score}/100`;

export const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};
