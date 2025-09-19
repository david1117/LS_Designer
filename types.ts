
export type SpaceOption = 'Living Room' | 'Bedroom' | 'Dining Room' | 'Office' | 'Outdoor Patio' | 'Kitchen';
export type StyleOption = 'Modern' | 'Minimalist' | 'Scandinavian' | 'Industrial' | 'Bohemian' | 'Coastal' | 'Farmhouse' | 'Japandi' | 'Mediterranean' | 'Art Deco' | 'Mid-Century Modern' | 'French Country' | 'Rustic';

export enum GenerationMethod {
    Describe = 'describe',
    Reference = 'reference',
    Edit = 'edit',
    AddDecoration = 'addDecoration',
    RemoveObject = 'removeObject',
}