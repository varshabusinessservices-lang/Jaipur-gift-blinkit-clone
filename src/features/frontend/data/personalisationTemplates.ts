import { PersonalisationTemplate } from '../types';

export const defaultPersonalisationTemplates: PersonalisationTemplate[] = [
  {
    id: 'tpl-1',
    code: 'SINGLE_PHOTO_NAME',
    name: '1. Single Photo + Name',
    description: 'One high-res image upload, recipient name, and optional short message with WhatsApp contact.',
    templateType: 'single_photo_name',
    isActive: true,
    fields: [
      { id: 'photo', label: 'Upload Photo', type: 'image', required: true, helpText: 'Upload clear high resolution image.' },
      { id: 'name', label: 'Recipient Name', type: 'text', required: true, placeholder: 'e.g. Aarav Sharma' },
      { id: 'message', label: 'Short Message', type: 'textarea', required: false, placeholder: 'Happy Birthday!' },
      { id: 'whatsapp', label: 'WhatsApp Number for Preview Approval', type: 'number', required: true, placeholder: '9876543210' }
    ]
  },
  {
    id: 'tpl-2',
    code: 'PHOTO_NAME_MESSAGE',
    name: '2. Photo + Name + Message',
    description: 'Photo upload, first & last name, detailed gift message, and occasion.',
    templateType: 'photo_name_message',
    isActive: true,
    fields: [
      { id: 'photo', label: 'Primary Photo', type: 'image', required: true },
      { id: 'firstName', label: 'First Name', type: 'text', required: true, placeholder: 'Priya' },
      { id: 'lastName', label: 'Last Name', type: 'text', required: false, placeholder: 'Verma' },
      { id: 'giftMessage', label: 'Gift Message', type: 'textarea', required: true, placeholder: 'Wishing you all the joy in the world.' },
      { id: 'occasion', label: 'Occasion', type: 'dropdown', required: true, options: ['Birthday', 'Anniversary', 'Wedding', 'Valentine', 'Housewarming', 'Other'] },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true, placeholder: '9876543210' }
    ]
  },
  {
    id: 'tpl-3',
    code: 'COUPLE_ANNIVERSARY',
    name: '3. Couple Photos + Names + Anniversary Date',
    description: 'Two photos for couple, couple names, anniversary date, and short message.',
    templateType: 'couple_anniversary',
    isActive: true,
    fields: [
      { id: 'photo1', label: 'First Person Photo', type: 'image', required: true },
      { id: 'photo2', label: 'Second Person Photo', type: 'image', required: true },
      { id: 'coupleNames', label: 'Couple Names', type: 'text', required: true, placeholder: 'Aarav & Priya' },
      { id: 'anniversaryDate', label: 'Anniversary Date', type: 'date', required: true },
      { id: 'message', label: 'Love Message', type: 'textarea', required: false, placeholder: 'Happy 5th Anniversary!' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-4',
    code: 'BIRTHDAY',
    name: '4. Birthday Photo + Name + DOB + Message',
    description: 'Birthday celebration photo, person name, date of birth, age, and message.',
    templateType: 'birthday',
    isActive: true,
    fields: [
      { id: 'photo', label: 'Birthday Photo', type: 'image', required: true },
      { id: 'name', label: 'Person Name', type: 'text', required: true, placeholder: 'Rohan Meena' },
      { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { id: 'age', label: 'Turning Age (Optional)', type: 'number', required: false, placeholder: '25' },
      { id: 'message', label: 'Birthday Wish', type: 'textarea', required: true, placeholder: 'Have an awesome year ahead!' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-5',
    code: 'BABY_DETAILS',
    name: '5. Baby Details Form',
    description: 'Baby birth stats including weight, time, hospital, and parents names.',
    templateType: 'baby_details',
    isActive: true,
    fields: [
      { id: 'babyPhoto', label: 'Baby Photo', type: 'image', required: true },
      { id: 'babyName', label: 'Baby Name', type: 'text', required: true, placeholder: 'Baby Vivaan' },
      { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
      { id: 'birthTime', label: 'Birth Time', type: 'text', required: true, placeholder: '04:15 PM' },
      { id: 'weight', label: 'Birth Weight', type: 'text', required: true, placeholder: '3.2 kg' },
      { id: 'hospital', label: 'Hospital Name', type: 'text', required: false, placeholder: 'Fortis Jaipur' },
      { id: 'parents', label: 'Parents Names', type: 'text', required: true, placeholder: 'Karan & Neha' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-6',
    code: 'FAMILY_COLLAGE',
    name: '6. Family Photo Collage Form',
    description: 'Main family photo plus up to 7 additional member photos and family title.',
    templateType: 'family_collage',
    isActive: true,
    fields: [
      { id: 'mainPhoto', label: 'Main Family Photo', type: 'image', required: true },
      { id: 'subPhoto1', label: 'Member Photo 1', type: 'image', required: false },
      { id: 'subPhoto2', label: 'Member Photo 2', type: 'image', required: false },
      { id: 'familyName', label: 'Family Surname / Title', type: 'text', required: true, placeholder: 'The Sharma Family' },
      { id: 'message', label: 'Family Motto / Quote', type: 'textarea', required: false, placeholder: 'Together is our favourite place to be.' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-7',
    code: 'MULTI_PHOTO_COLLAGE',
    name: '7. Multi-Photo Collage Form',
    description: 'Upload multiple photos (3 to 15 images) for a stunning memory collage frame.',
    templateType: 'multi_photo_collage',
    isActive: true,
    fields: [
      { id: 'collageImages', label: 'Upload Collage Photos (Min 3)', type: 'image', required: true, helpText: 'Upload up to 10 photos.' },
      { id: 'title', label: 'Collage Title', type: 'text', required: true, placeholder: 'Our Best Memories 2026' },
      { id: 'subtitle', label: 'Subtitle / Date Range', type: 'text', required: false, placeholder: 'Jaipur Trip & Celebrations' },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-8',
    code: 'TSHIRT_CUSTOM',
    name: '8. T-Shirt Customisation Form',
    description: 'Artwork upload, custom text, size selection, color, and print position.',
    templateType: 'tshirt_custom',
    isActive: true,
    fields: [
      { id: 'artwork', label: 'Logo / Artwork Upload', type: 'image', required: false },
      { id: 'text', label: 'Custom Text on T-Shirt', type: 'text', required: false, placeholder: 'BOSS 2026' },
      { id: 'size', label: 'Size', type: 'dropdown', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'color', label: 'T-Shirt Color', type: 'dropdown', required: true, options: ['Jet Black', 'Pure White', 'Navy Blue', 'Maroon', 'Heather Grey'] },
      { id: 'position', label: 'Print Position', type: 'radio', required: true, options: ['Front Center', 'Back Large', 'Left Chest Pocket'] },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-9',
    code: 'MUG_CUSTOM',
    name: '9. Mug Customisation Form',
    description: 'Image upload, custom name, gift message, mug type, and print side.',
    templateType: 'mug_custom',
    isActive: true,
    fields: [
      { id: 'mugImage', label: 'Mug Photo Upload', type: 'image', required: true },
      { id: 'name', label: 'Name on Mug', type: 'text', required: true, placeholder: 'Best Dad Ever' },
      { id: 'message', label: 'Backside Message', type: 'textarea', required: false, placeholder: 'We love you to the moon and back!' },
      { id: 'mugType', label: 'Mug Material / Type', type: 'dropdown', required: true, options: ['Classic White Ceramic', 'Magic Heat Reveal Black Mug', 'Heart Handle Red Mug'] },
      { id: 'printSide', label: 'Print Side', type: 'radio', required: true, options: ['Both Sides', 'Right Handed Only', 'Left Handed Only'] },
      { id: 'whatsapp', label: 'WhatsApp Number', type: 'number', required: true }
    ]
  },
  {
    id: 'tpl-10',
    code: 'FULLY_CUSTOM',
    name: '10. Fully Custom Gift Form',
    description: 'Fully configurable custom gift form for special bespoke orders.',
    templateType: 'fully_custom',
    isActive: true,
    fields: [
      { id: 'customImage', label: 'Reference Image Upload', type: 'image', required: false },
      { id: 'instructions', label: 'Detailed Custom Instructions', type: 'textarea', required: true, placeholder: 'Specify exact engraving font, placement, and color details...' },
      { id: 'giftWrap', label: 'Premium Gift Wrapping Style', type: 'dropdown', required: true, options: ['Royal Gold Box', 'Classic Red Ribbon', 'Floral Eco Wrap', 'None'] },
      { id: 'whatsapp', label: 'WhatsApp Number for Design Proof', type: 'number', required: true, placeholder: '9876543210' }
    ]
  }
];
