/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { LooksIcon, PortraitIcon, MakeupIcon, HairIcon, BodyIcon, BackgroundIcon, LightColorIcon } from '../components/icons';

export interface Tool {
  name: string;
  prompt: string;
}

export interface SubCategory {
  name: string;
  tools: Tool[];
}

export interface Category {
  id: 'looks' | 'portrait' | 'makeup' | 'hair' | 'body' | 'background' | 'light_color';
  name: string;
  icon: React.FC<{ className?: string }>;
  subCategories?: SubCategory[];
  tools?: Tool[];
}

export const toolData: Category[] = [
  {
    id: 'looks',
    name: 'Looks',
    icon: LooksIcon,
    tools: [
      { name: 'Auto Enhance', prompt: 'Perform an automatic enhancement of the image, balancing brightness, contrast, and color for a clean, vibrant look.' },
      { name: 'Natural Clean', prompt: 'Apply a subtle enhancement for a clean, natural look. Balances exposure and adds a touch of vibrancy.' },
      { name: 'No-Makeup', prompt: 'Create a "no-makeup" makeup look, evening out skin tone and subtly enhancing features for a natural, polished appearance.' },
      { name: 'Headshot Pro', prompt: 'Apply professional lighting and sharpening for a crisp, corporate headshot look. Minimizes shadows and enhances detail.' },
      { name: 'Glam Night', prompt: 'Apply a glamorous, high-contrast look suitable for evening or night photos, with deep shadows and vibrant highlights.' },
      { name: 'Cinematic', prompt: 'Apply a teal-and-orange color grade for a modern cinematic look.' },
      { name: 'Vintage', prompt: 'Apply a classic faded film look with muted colors and slightly reduced contrast for a nostalgic feel.' },
      { name: 'Soft Film', prompt: 'Apply a soft, gentle film-like quality with subtle grain and softened highlights.' },
      { name: 'Crisp B&W', prompt: 'Apply a sharp, high-contrast black and white conversion with deep blacks and bright whites.' },
    ],
  },
  {
    id: 'portrait',
    name: 'Portrait',
    icon: PortraitIcon,
    subCategories: [
      {
        name: 'Skin',
        tools: [
          { name: 'Retouch', prompt: 'Perform a comprehensive but natural skin retouch. Smooth the skin texture, even out the skin tone by reducing redness and blotches, and remove minor blemishes.' },
          { name: 'Blemish Remove', prompt: 'Remove any obvious blemishes like pimples or spots from the skin. The result should be natural and preserve skin texture.' },
          { name: 'Even Tone', prompt: 'Even out the skin tone, reducing redness or blotchiness for a smoother, more uniform appearance.' },
          { name: 'De-shine', prompt: 'Reduce oily shine from the skin, giving it a more natural, matte finish.' },
          { name: 'Tan', prompt: 'Apply a natural-looking, healthy tan to the skin.' },
          { name: 'Reduce Pores', prompt: 'Subtly reduce the visibility of pores on the skin for a smoother finish.' },
        ],
      },
      {
        name: 'Eyes',
        tools: [
          { name: 'Whiten Sclera', prompt: 'Slightly and naturally whiten the sclera (the white part) of the eyes. The goal is to make the eyes look brighter and healthier, not artificially white.' },
          { name: 'De-puff Bags', prompt: 'Reduce the appearance of puffiness or bags under the eyes for a more rested look.' },
          { name: 'Sharpen Iris', prompt: 'Enhance the detail, color, and sharpness of the iris to make the eyes more captivating.' },
          { name: 'Add Catchlights', prompt: 'Add natural-looking catchlights (reflections of light) to the eyes to make them sparkle.' },
          { name: 'Enhance Lashes', prompt: 'Make the eyelashes appear slightly longer, darker, and more defined.' },
          { name: 'Remove Glare', prompt: 'Remove distracting glare from eyeglasses.' },
        ],
      },
      {
        name: 'Face Shape',
        tools: [
          { name: 'Slim Face', prompt: 'Subtly slim the overall face shape and jawline, creating a more V-shaped contour.' },
          { name: 'Sharpen Jawline', prompt: 'Add definition and a subtle shadow to sculpt and sharpen the jawline.' },
          { name: 'Refine Nose', prompt: 'Subtly refine and narrow the width of the nose.' },
          { name: 'Add Smile', prompt: 'Add a subtle, natural-looking closed-mouth smile.' },
        ],
      },
      {
        name: 'Facial Hair',
        tools: [
            { name: 'Add Beard', prompt: 'Add a realistic, full, well-groomed dark brown beard.' },
            { name: 'Trim Beard', prompt: 'Neaten and trim the existing beard for a sharper look.' },
            { name: 'Remove Beard', prompt: 'Completely remove the beard and stubble for a clean-shaven look.' },
        ],
      }
    ],
  },
  {
    id: 'makeup',
    name: 'Makeup',
    icon: MakeupIcon,
    subCategories: [
        {
            name: 'Sets',
            tools: [
                { name: 'Soft Glam', prompt: 'Apply a photorealistic "soft glam" makeup look. This should include soft neutral eyeshadow, a hint of peach blush, and a natural nude lipstick.' },
                { name: 'Office Minimal', prompt: 'Apply a minimal, professional makeup look suitable for an office setting. Clean foundation, neutral eyeshadow, light mascara.' },
                { name: 'Smokey Night', prompt: 'Apply a dramatic "smokey night" makeup look. This includes a classic dark smokey eye, sculpted contour on the cheeks, and a matte nude lip.' },
                { name: 'Sun-Kissed', prompt: 'Apply a warm, sun-kissed makeup look with bronzer, glowing highlighter, and a glossy coral lip.' },
            ]
        },
        {
            name: 'Base',
            tools: [
                { name: 'Foundation', prompt: 'Apply a natural-looking foundation that matches the skin tone perfectly and evens out the complexion.' },
                { name: 'Concealer', prompt: 'Apply concealer under the eyes to brighten the area and cover any dark circles.' },
                { name: 'Contour', prompt: 'Apply a subtle powder contour to the cheekbones and jawline to add definition.' },
            ]
        },
        {
            name: 'Eyes',
            tools: [
                { name: 'Nude Palette', prompt: 'Apply a neutral, nude-toned eyeshadow palette for a natural look.' },
                { name: 'Winged Eyeliner', prompt: 'Apply a sharp, classic black winged eyeliner.' },
                { name: 'Dramatic Lashes', prompt: 'Apply long, voluminous false eyelashes for a dramatic effect.' },
            ]
        }
    ]
  },
  {
    id: 'hair',
    name: 'Hair',
    icon: HairIcon,
    subCategories: [
        {
            name: 'Style',
            tools: [
                { name: 'Volume', prompt: 'Add significant volume and body to the hair, especially at the roots, making it look fuller.' },
                { name: 'Wavy', prompt: 'Give the hair natural-looking, soft beach waves.' },
                { name: 'Straighten', prompt: 'Make the hair straight, sleek, and smooth, as if styled with a flat iron.' },
                { name: 'Fill Hairline', prompt: 'Subtly fill in the hairline to make it appear fuller and more dense.' },
            ]
        },
        {
            name: 'Color',
            tools: [
                { name: 'Blonde', prompt: 'Change the hair color to a natural-looking blonde with realistic highlights and lowlights.' },
                { name: 'Brunette', prompt: 'Change the hair color to a rich, dark brunette with depth and shine.' },
                { name: 'Redhead', prompt: 'Change the hair color to a natural-looking auburn or copper red.' },
                { name: 'Balayage', prompt: 'Add a subtle, natural-looking balayage highlight effect to the hair.' },
            ]
        }
    ]
  },
  {
    id: 'body',
    name: 'Body',
    icon: BodyIcon,
    tools: [
        { name: 'Slim Waist', prompt: 'Subtly slim the waist for a more defined figure. The result should be natural.' },
        { name: 'Tone Arms', prompt: 'Make the arms appear slightly more toned and defined.' },
        { name: 'Lengthen Legs', prompt: 'Slightly lengthen the legs to enhance perspective. Keep it subtle.' },
        { name: 'Smooth Skin', prompt: 'Even out the skin tone on the body for a smoother appearance.' },
    ],
  },
  {
    id: 'background',
    name: 'Background',
    icon: BackgroundIcon,
    tools: [
        { name: 'Blur (Bokeh)', prompt: 'Apply a realistic, creamy bokeh blur effect to the background, keeping the main subject in sharp focus.' },
        { name: 'Replace: Studio', prompt: 'Replace the background with a clean, professional grey studio backdrop.' },
        { name: 'Replace: Sunset', prompt: 'Replace the background with a beautiful, scenic sunset over an ocean.' },
        { name: 'Remove Objects', prompt: 'Identify and remove any distracting objects from the background, filling in the space seamlessly.' },
    ],
  },
  {
    id: 'light_color',
    name: 'Light & Color',
    icon: LightColorIcon,
    tools: [
        { name: 'Studio Light', prompt: 'Add dramatic, professional studio lighting to the main subject, with a key light and soft fill light.' },
        { name: 'Warmer', prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
        { name: 'Exposure', prompt: 'Correct the overall exposure, brightening the image slightly without blowing out the highlights.' },
        { name: 'Clarity', prompt: 'Increase the local contrast and clarity to make details pop, without adding harshness.' },
        { name: 'Vibrance', prompt: 'Increase the vibrance of the colors, making them richer and more saturated in a natural way.' },
    ],
  },
];
