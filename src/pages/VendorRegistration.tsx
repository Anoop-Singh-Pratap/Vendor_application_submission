import React, { useState, useCallback, useEffect, ChangeEvent, DragEvent, FormEvent, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Upload, Check, FileText, Building, User, Phone, Mail, Briefcase, CheckCircle, Globe, X, AlertCircle, Loader2, ChevronRight, ArrowRight, TrendingUp, ShieldCheck, Award, Plus
} from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import api from '../config/api';

// --- Constants and Types ---
interface VendorFormData {
  name: string;
  designation: string;
  companyName: string;
  firmType: string;
  vendorType: string; // domestic or global
  country: string;
  website?: string;
  contactNo: string; // Will store the full international number, e.g., +91xxxxxxxxxx or +1xxxxxxxxxx
  email: string;
  category: string;
  productDescription: string;
  majorClients?: string;
  turnover: string;
  turnoverCurrency: string; // 'INR' or 'USD'
  gstNumber?: string;
  terms: boolean;
}

const firmTypes = [
  { id: 'manufacturer', label: 'MANUFACTURER/OEM' },
  { id: 'dealer', label: 'DEALER/TRADER' },
  { id: 'oem-distributor', label: 'OEM AUTHORISED DISTRIBUTER' },
  { id: 'service', label: 'SERVICE COMPANY' },
  { id: 'consultant', label: 'CONSULTANT/AGENCY' },
];

const categories = [
  // ... (categories remain the same)
  { id: 'stationary-computer', label: 'Stationary, Computer & Computer Accessories' },
  { id: 'cloth-textiles', label: 'Cloth, Textiles' },
  { id: 'rubber-pvc-belts', label: 'Rubber, PVC, Conveyor Belts, V Belts, Tyre' },
  { id: 'safety-fire-service', label: 'Safety Items & Fire Service' },
  { id: 'paint-abrasive-hardware', label: 'Paint, Abrasive, Hardware' },
  { id: 'pipe-building-material', label: 'Pipe, Pipe Fitting, Building Material & Sanitary' },
  { id: 'packing-materials', label: 'Packing Materials' },
  { id: 'chemicals', label: 'Chemicals' },
  { id: 'gases', label: 'Gases' },
  { id: 'petroleum-lubricants', label: 'Petrol, Oils, Lubricant & HSD' },
  { id: 'refractory-basic-mcb', label: 'Refractory - Basic, MCB' },
  { id: 'refractory-castables', label: 'Refractory - Castables & other Bricks' },
  { id: 'raw-materials', label: 'Raw Materials' },
  { id: 'instrumentation-electronics', label: 'Instrumentation & Electronics items' },
  { id: 'bearings-cutting-tools', label: 'Bearings, cutting tools' },
  { id: 'fastener-nut-bolts', label: 'Fastener, Nut & Bolts' },
  { id: 'tools-lifting-equipment', label: 'Tools & Tackles & Lifting Equipment' },
  { id: 'electrical-spares', label: 'Electrical Spares' },
  { id: 'cable-winding-wires', label: 'Cable, Cabling Accessories & Winding Wires' },
  { id: 'electrical-consumables', label: 'Electrical Consumables' },
  { id: 'motors-spares', label: 'Motors & Motor Spares' },
  { id: 'electrical-welding-equipment', label: 'Electrical Equ & Welding Equ' },
  { id: 'fluxes-electrodes', label: 'Fluxes & Electrodes' },
  { id: 'rolls-roll-chocks', label: 'Rolls & Roll Chocks' },
  { id: 'minor-raw-materials', label: 'Minor Raw Materials, Ferron Alloys' },
  { id: 'amc-civil', label: 'AMC-Civil' },
  { id: 'amc-electrical', label: 'AMC-electrical' },
  { id: 'amc-mechanical', label: 'AMC-Mechanical' },
  { id: 'amc-others', label: 'AMC-others (IT, rent, HR related, Mrk related etc)' },
  { id: 'material-handling-rental', label: 'Material Handling equip Rental' },
  { id: 'logistics', label: 'Logistics (sea, CHAs)' }
];

// Base list of countries (deduplication will be applied)
const baseCountriesList = [
  { code: "in", name: "India", countryCode: "+91" },
  { code: "ae", name: "United Arab Emirates", countryCode: "+971" },
  { code: "au", name: "Australia", countryCode: "+61" },
  { code: "bd", name: "Bangladesh", countryCode: "+880" },
  { code: "bt", name: "Bhutan", countryCode: "+975" },
  { code: "br", name: "Brazil", countryCode: "+55" },
  { code: "ca", name: "Canada", countryCode: "+1" },
  { code: "cn", name: "China", countryCode: "+86" },
  { code: "co", name: "Colombia", countryCode: "+57" },
  // { code: "cz", name: "Czech Republic", countryCode: "+420" }, // Duplicate, will be handled
  { code: "de", name: "Germany", countryCode: "+49" },
  // { code: "dk", name: "Denmark", countryCode: "+45" }, // Duplicate
  { code: "eg", name: "Egypt", countryCode: "+20" },
  { code: "es", name: "Spain", countryCode: "+34" },
  // { code: "fi", name: "Finland", countryCode: "+358" }, // Duplicate
  { code: "fr", name: "France", countryCode: "+33" },
  { code: "gb", name: "United Kingdom", countryCode: "+44" },
  { code: "gr", name: "Greece", countryCode: "+30" },
  { code: "hu", name: "Hungary", countryCode: "+36" },
  { code: "id", name: "Indonesia", countryCode: "+62" },
  // { code: "ie", name: "Ireland", countryCode: "+353" }, // Duplicate
  // { code: "il", name: "Israel", countryCode: "+972" }, // Duplicate
  { code: "it", name: "Italy", countryCode: "+39" },
  { code: "jp", name: "Japan", countryCode: "+81" },
  { code: "kr", name: "South Korea", countryCode: "+82" },
  { code: "lk", name: "Sri Lanka", countryCode: "+94" },
  { code: "mx", name: "Mexico", countryCode: "+52" },
  { code: "my", name: "Malaysia", countryCode: "+60" },
  { code: "ng", name: "Nigeria", countryCode: "+234" },
  { code: "nl", name: "Netherlands", countryCode: "+31" },
  // { code: "no", name: "Norway", countryCode: "+47" }, // Duplicate
  { code: "np", name: "Nepal", countryCode: "+977" },
  { code: "nz", name: "New Zealand", countryCode: "+64" },
  { code: "ph", name: "Philippines", countryCode: "+63" },
  { code: "pl", name: "Poland", countryCode: "+48" },
  { code: "pt", name: "Portugal", countryCode: "+351" },
  { code: "qa", name: "Qatar", countryCode: "+974" },
  { code: "ro", name: "Romania", countryCode: "+40" },
  { code: "ru", name: "Russia", countryCode: "+7" },
  { code: "sa", name: "Saudi Arabia", countryCode: "+966" },
  { code: "se", name: "Sweden", countryCode: "+46" },
  { code: "sg", name: "Singapore", countryCode: "+65" },
  { code: "th", name: "Thailand", countryCode: "+66" },
  { code: "tr", name: "Turkey", countryCode: "+90" },
  { code: "us", name: "United States", countryCode: "+1" },
  { code: "ve", name: "Venezuela", countryCode: "+58" },
  { code: "vn", name: "Vietnam", countryCode: "+84" },
  { code: "za", name: "South Africa", countryCode: "+27" },
  { code: "ch", name: "Switzerland", countryCode: "+41" },
  { code: "be", name: "Belgium", countryCode: "+32" },
  { code: "ar", name: "Argentina", countryCode: "+54" },
  { code: "cl", name: "Chile", countryCode: "+56" },
  { code: "pk", name: "Pakistan", countryCode: "+92" },
  { code: "ua", name: "Ukraine", countryCode: "+380" },
  { code: "at", name: "Austria", countryCode: "+43" },
  { code: "pe", name: "Peru", countryCode: "+51" },
  { code: "cz", name: "Czech Republic", countryCode: "+420" },
  { code: "sk", name: "Slovakia", countryCode: "+421" },
  { code: "si", name: "Slovenia", countryCode: "+386" },
  { code: "hr", name: "Croatia", countryCode: "+385" },
  { code: "bg", name: "Bulgaria", countryCode: "+359" },
  { code: "ee", name: "Estonia", countryCode: "+372" },
  { code: "lt", name: "Lithuania", countryCode: "+370" },
  { code: "lv", name: "Latvia", countryCode: "+371" },
  { code: "rs", name: "Serbia", countryCode: "+381" },
  { code: "by", name: "Belarus", countryCode: "+375" },
  { code: "ge", name: "Georgia", countryCode: "+995" },
  { code: "il", name: "Israel", countryCode: "+972" },
  { code: "ie", name: "Ireland", countryCode: "+353" },
  { code: "dk", name: "Denmark", countryCode: "+45" },
  { code: "no", name: "Norway", countryCode: "+47" },
  { code: "fi", name: "Finland", countryCode: "+358" },
  { code: "is", name: "Iceland", countryCode: "+354" },
  { code: "lu", name: "Luxembourg", countryCode: "+352" },
  { code: "mt", name: "Malta", countryCode: "+356" },
  { code: "cy", name: "Cyprus", countryCode: "+357" },
  { code: "md", name: "Moldova", countryCode: "+373" },
  { code: "al", name: "Albania", countryCode: "+355" },
  { code: "mk", name: "North Macedonia", countryCode: "+389" },
  { code: "me", name: "Montenegro", countryCode: "+382" },
  { code: "ba", name: "Bosnia and Herzegovina", countryCode: "+387" },
  { code: "li", name: "Liechtenstein", countryCode: "+423" },
  { code: "sm", name: "San Marino", countryCode: "+378" },
  { code: "mc", name: "Monaco", countryCode: "+377" },
  { code: "va", name: "Vatican City", countryCode: "+39" }, // Note: Same code as Italy
];

const uniqueCountriesMap = new Map<string, { code: string; name: string; countryCode: string }>();
baseCountriesList.forEach(country => {
    if (!uniqueCountriesMap.has(country.code)) {
        uniqueCountriesMap.set(country.code, country);
    } else {
        // Handle Vatican City manually if it has same code as Italy but different name
        if (country.code === 'va' && country.name === 'Vatican City') {
             uniqueCountriesMap.set(country.code, country); // Prefer Vatican if 'va' means Vatican specifically
        }
    }
});
// Ensure Italy is present if Vatican overwrote it due to same country code
if (!Array.from(uniqueCountriesMap.values()).find(c => c.code === 'it' && c.name === 'Italy')) {
    const italyData = baseCountriesList.find(c => c.code === 'it' && c.name === 'Italy');
    if (italyData) uniqueCountriesMap.set('it', italyData);
}


const dedupedCountriesArray = Array.from(uniqueCountriesMap.values());
const sortableCountries = dedupedCountriesArray.sort((a, b) => a.name.localeCompare(b.name));

const countries = [
  ...sortableCountries,
  { code: "others", name: "Others", countryCode: "" },
];


const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    let input = phoneNumber.trim();
    let prefixToUse = countryCode ? countryCode.trim() : "";

    // Remove existing prefix from input if it matches prefixToUse, to avoid duplication like +1+1...
    if (prefixToUse && input.startsWith(prefixToUse)) {
        input = input.substring(prefixToUse.length).trim();
    } else if (input.startsWith('+') && prefixToUse && input.startsWith(prefixToUse.substring(1))) {
        // Handles case where input is like "1 123" and prefixToUse is "+1"
        // This case might be complex and depends on how aggressively initial plus is stripped.
        // Let's assume input is mostly national part or full number.
    }


    // Get only digits from the (potentially national) input part
    let nationalDigits = input.replace(/\D/g, '');

    if (!prefixToUse && input.startsWith('+')) { // User is typing an international number manually
        const potentialPrefix = input.match(/^(\+\d{1,4})/);
        if (potentialPrefix) {
            prefixToUse = potentialPrefix[0];
            nationalDigits = input.substring(prefixToUse.length).replace(/\D/g, '');
        } else { // Just a plus, or invalid
            return '+' + nationalDigits; // Or just nationalDigits if no clear prefix
        }
    } else if (!prefixToUse && nationalDigits.length > 0) { // No country code given, but has digits, assume it's local or needs prefix
        return nationalDigits; // Or prepend a default "+" if it's meant to be international
    }


    if (!prefixToUse) return nationalDigits; // Cannot format without a country code

    let formatted = prefixToUse;
    if (nationalDigits.length > 0) {
        formatted += " " + nationalDigits; // Basic spacing

        // India specific formatting
        if (prefixToUse === '+91' && nationalDigits.length === 10) {
            formatted = `${prefixToUse} ${nationalDigits.substring(0, 5)} ${nationalDigits.substring(5)}`;
        }
        // Add more country-specific formatting rules here if needed
        // e.g. USA: +1 XXX XXX XXXX
        else if (prefixToUse === '+1' && nationalDigits.length === 10) {
             formatted = `${prefixToUse} ${nationalDigits.substring(0,3)} ${nationalDigits.substring(3,6)} ${nationalDigits.substring(6)}`;
        }
    }
    return formatted.trim();
};

const validatePhoneNumber = (fullPhoneNumber: string, countryCode: string): boolean => {
  if (!countryCode) { // If no country code context, try a generic validation
    const digits = fullPhoneNumber.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15; // Common international range
  }

  let nationalNumberPart = fullPhoneNumber;
  // Strip the country code from the beginning of the full number to get the national part
  if (fullPhoneNumber.startsWith(countryCode)) {
    nationalNumberPart = fullPhoneNumber.substring(countryCode.length);
  }
  
  const nationalDigits = nationalNumberPart.replace(/\D/g, '');

  if (countryCode === '+91') {
    return nationalDigits.length === 10;
  }
  // Generic validation for other countries (minimum 7 digits for national part)
  return nationalDigits.length >= 7 && nationalDigits.length <= 14; // Adjust max as needed
};
// ... (Helper Components FormField, SectionHeader remain the same)
interface FormFieldProps {
  id: keyof VendorFormData | string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({ id, label, required, children, error, className }) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={id as string} className="text-sm font-medium text-muted-foreground/90">
      {label} {required && <span className="text-rashmi-red">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-destructive flex items-center gap-1 pt-1"><AlertCircle size={13} /> {error}</p>}
  </div>
);

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, description }) => (
  <div className="mb-6">
    <div className="flex items-center mb-2">
        <span className="p-2 bg-rashmi-red/10 rounded-full mr-3">
          <Icon className="h-5 w-5 text-rashmi-red" />
        </span>
        <h3 className="text-xl font-semibold text-foreground tracking-tight">
         {title}
        </h3>
    </div>
    {description && <p className="text-sm text-muted-foreground ml-12 -mt-1">{description}</p>}
    <div className="mt-3 ml-12 h-[1px] bg-gradient-to-r from-rashmi-red/30 via-border to-transparent w-2/3"></div>
  </div>
);

// ... (Animation Variants remain the same)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const shimmerVariants: Variants = {
  initial: { backgroundPosition: '200% 0' },
  animate: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};


const VendorRegistration: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [customCountryCode, setCustomCountryCode] = useState('');
  const [countrySearchTerm, setCountrySearchTerm] = useState('');


  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch, setValue, trigger } = useForm<VendorFormData>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      designation: '',
      companyName: '',
      firmType: '',
      vendorType: 'domestic',
      country: 'in',
      website: '',
      contactNo: '+91 ', // Default for India
      email: '',
      category: '',
      productDescription: '',
      majorClients: '',
      turnover: '',
      turnoverCurrency: 'INR',
      gstNumber: '',
      terms: false,
    }
  });

  const heroControls = useAnimation();
  const formControls = useAnimation();

  useEffect(() => {
    heroControls.start("visible");
    formControls.start("visible");
  }, [heroControls, formControls]);

  const watchedVendorType = watch('vendorType');
  const watchedCountry = watch('country');
  const contactNoRHF = watch('contactNo'); // Full international number stored here

  // File handling (remains largely the same, ensure callbacks have all deps)
  const clearAllFiles = useCallback(() => {
    setFiles([]);
    setFileNames([]);
    setFilePreviews([]);
    setFileErrors([]);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

  const clearFile = useCallback((index?: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (index !== undefined) {
      if (filePreviews[index] && filePreviews[index].startsWith('blob:')) {
        URL.revokeObjectURL(filePreviews[index]);
      }
      const removedFileName = fileNames[index];
      setFiles(prev => prev.filter((_, i) => i !== index));
      setFileNames(prev => prev.filter((_, i) => i !== index));
      setFilePreviews(prev => prev.filter((_, i) => i !== index));
      setFileErrors(prev => prev.filter(err => !err.includes(`"${removedFileName}"`)));
    } else {
      filePreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
      clearAllFiles();
    }
  }, [filePreviews, fileNames, clearAllFiles]);

  const handleFileValidation = (selectedFile: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(selectedFile.type)) return false;
    if (selectedFile.size > MAX_FILE_SIZE_BYTES) return false;
    return true;
  };

   const processFiles = useCallback((selectedFiles: FileList) => {
    const currentFilesCount = files.length;
    const filesToAdd: File[] = [];
    const namesToAdd: string[] = [];
    const previewsToAdd: string[] = [];
    const errorsToAdd: string[] = [];

    Array.from(selectedFiles).every(file => { // Use .every to allow early exit
        if (currentFilesCount + filesToAdd.length >= 3) {
            if (!errorsToAdd.some(e => e.startsWith("Maximum 3 files allowed."))) {
                 errorsToAdd.push(`Maximum 3 files allowed. Only ${3-currentFilesCount} more can be added.`);
            }
            return false; // Stop processing more files
        }

        if (!handleFileValidation(file)) {
            const errorMessage = file.size > MAX_FILE_SIZE_BYTES
                ? `File "${file.name}" is too large (Max ${MAX_FILE_SIZE_MB}MB).`
                : `File "${file.name}" has an invalid format. Only PDF/Word allowed.`;
            errorsToAdd.push(errorMessage);
            return true; // Continue to next file
        }

        filesToAdd.push(file);
        namesToAdd.push(file.name);

        if (file.type.startsWith('image/')) { // Unlikely with current ALLOWED_FILE_TYPES
            const reader = new FileReader();
            reader.onloadend = () => { // This is async, direct push might be an issue for order
                setFilePreviews(prev => {
                    const newPreviews = [...prev];
                    const targetIndex = prev.length - filesToAdd.length + namesToAdd.indexOf(file.name); // Approximate index
                    if (targetIndex >= 0 && targetIndex < newPreviews.length) newPreviews[targetIndex] = reader.result as string;
                    return newPreviews;
                });
            };
            reader.readAsDataURL(file);
            previewsToAdd.push(''); // Placeholder
        } else if (file.type === 'application/pdf') {
            previewsToAdd.push(URL.createObjectURL(file));
        } else {
            previewsToAdd.push('');
        }
        return true;
    });

    if (filesToAdd.length > 0) {
        setFiles(prev => [...prev, ...filesToAdd]);
        setFileNames(prev => [...prev, ...namesToAdd]);
        setFilePreviews(prev => [...prev, ...previewsToAdd]);
    }
    if (errorsToAdd.length > 0) {
        setFileErrors(prev => [...prev.filter(e => !e.startsWith("Maximum 3 files allowed.")), ...errorsToAdd]);
    }
}, [files.length]); // Dependency on files.length is key here


  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleFileDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const onSubmit: SubmitHandler<VendorFormData> = async (data) => {
    // ... (onSubmit logic remains largely the same, ensure data.contactNo is the full international number)
     try {
      setUploadProgress(10);

      const formData = new FormData();
      // Ensure contactNo is the full international number before appending
      const fullContactNo = data.contactNo; // Already should be full from setValue
      
      Object.entries({...data, contactNo: fullContactNo}).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            formData.append(key, String(value));
          } else if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value)); // Ensure string for all non-file values
          }
      });

      if (data.country === 'others' && customCountry) {
        formData.append('customCountryName', customCountry);
      }
      if (data.country === 'others' && customCountryCode) {
        formData.append('customCountryDialCode', customCountryCode);
      }

      files.forEach((file) => formData.append('supportingDocuments', file));
      setUploadProgress(20);

      const response = await api.post('/vendors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || files.reduce((acc, f) => acc + f.size, 0) || 1;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(20 + (percentCompleted * 0.6));
        }
      });
      
      setUploadProgress(80);
      const responseData = response.data;

      if (responseData.success) {
        setUploadProgress(100);
        await new Promise<void>((resolve) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            setIsSubmitted(true);
            reset(); 
            clearAllFiles();
            setCustomCountry(''); 
            setCustomCountryCode('');
            setValue('vendorType', 'domestic', { shouldValidate: true }); // Explicitly reset after form reset
            setValue('country', 'in', { shouldValidate: true });
            // setValue('contactNo', '+91 ', { shouldValidate: true }); // useEffect will handle this
            resolve();
          }, 500);
        });
      } else {
        throw new Error(responseData.message || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFileErrors(prev => [...prev, error instanceof Error ? `Submission failed: ${error.message}` : 'Submission failed.']);
      setUploadProgress(0);
    } finally {
        setTimeout(() => setUploadProgress(0), isSubmitted ? 2000 : 1000);
    }
  };

  useEffect(() => { /* Parallax effect ... */ 
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    let ticking = false;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          parallaxElements.forEach((element) => {
            const el = element as HTMLElement;
            const speed = parseFloat(el.dataset.speed || '0.3');
            el.style.transform = `translateY(${lastScrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isOtherCountrySelected = watchedCountry === 'others';
  const isDomestic = watchedVendorType === 'domestic';
  
  const activeDialCode = useMemo(() => {
    if (isDomestic) return '+91';
    if (isOtherCountrySelected) return customCountryCode || ""; // Ensure customCountryCode is like "+XXX"
    const countryData = countries.find(c => c.code === watchedCountry);
    return countryData?.countryCode || "";
  }, [isDomestic, isOtherCountrySelected, watchedCountry, customCountryCode]);

  const shouldShowCountryCodeBadge = !isDomestic && !!activeDialCode;

  const contactPlaceholder = useMemo(() => {
    if (isDomestic) return 'XXXXXXXXXX (10 digits)';
    if (shouldShowCountryCodeBadge) return 'Your Number'; // Changed
    if (activeDialCode) return `${activeDialCode} Your Number`; 
    return 'Your Number (with +code)';
  }, [isDomestic, activeDialCode, shouldShowCountryCodeBadge]);


  useEffect(() => { /* Cleanup object URLs ... */ 
    return () => {
      filePreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [filePreviews]);

  // This derived value is for the *visual display* in the input field
  const contactNoDisplayValue = useMemo(() => {
    if (shouldShowCountryCodeBadge && activeDialCode && contactNoRHF.startsWith(activeDialCode)) {
        // Show only the national part, stripping the activeDialCode prefix
        return contactNoRHF.substring(activeDialCode.length).trimStart();
    }
    return contactNoRHF; // Otherwise, show the full stored value
  }, [contactNoRHF, shouldShowCountryCodeBadge, activeDialCode]);

  // Custom handler for contact number input when badge is shown
  const handleContactNoInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const nationalPartTyped = e.target.value;
    let numberToStore;

    if (shouldShowCountryCodeBadge && activeDialCode) {
        // User is typing the national part, reconstruct full number with activeDialCode
        numberToStore = activeDialCode + nationalPartTyped.replace(/\D/g, ''); // Only append digits
    } else {
        // User is typing the full number, possibly including their own prefix
        numberToStore = nationalPartTyped;
    }
    // formatPhoneNumber will then try to make sense of it and format correctly
    // It uses activeDialCode as a hint if numberToStore doesn't have a prefix.
    setValue('contactNo', formatPhoneNumber(numberToStore, activeDialCode), { shouldValidate: true });
  }, [activeDialCode, setValue, shouldShowCountryCodeBadge]);


  useEffect(() => {
    const currentVendorType = watchedVendorType;
    const currentCountry = watchedCountry;
    
    let newTargetCountryForField = currentCountry; 
    let newTargetPhonePrefix = "";

    if (currentVendorType === 'domestic') {
        newTargetPhonePrefix = '+91';
        if (currentCountry !== 'in') {
            newTargetCountryForField = 'in';
        }
    } else { // Global
        if (currentCountry === 'in') { 
            const usCountryData = countries.find(c => c.code === 'us');
            if (usCountryData) {
                newTargetCountryForField = 'us'; 
                newTargetPhonePrefix = usCountryData.countryCode;
            } else { 
                newTargetCountryForField = ''; 
                newTargetPhonePrefix = '';
            }
        } else if (currentCountry === 'others') {
            newTargetCountryForField = 'others';
            newTargetPhonePrefix = customCountryCode; 
        } else if (currentCountry) {
            const countryData = countries.find(c => c.code === currentCountry);
            newTargetPhonePrefix = countryData?.countryCode || '';
        } else {
             newTargetPhonePrefix = ''; 
        }
    }
    
    if (watch('country') !== newTargetCountryForField && newTargetCountryForField) {
        setValue('country', newTargetCountryForField, { shouldValidate: true, shouldDirty: (watch('country') !== newTargetCountryForField) });
    }

    const currentFullPhoneVal = watch('contactNo'); // Full number like +1123...
    let nationalPartOfCurrentPhone = currentFullPhoneVal;

    if (newTargetPhonePrefix && currentFullPhoneVal.startsWith(newTargetPhonePrefix)) {
        nationalPartOfCurrentPhone = currentFullPhoneVal.substring(newTargetPhonePrefix.length).replace(/\D/g,'');
    } else if (currentFullPhoneVal.startsWith('+')) { // Has some prefix, try to get national
        nationalPartOfCurrentPhone = currentFullPhoneVal.replace(/^\+\d*\s*/, '').replace(/\D/g,'');
    } else { // Assumed to be national or empty
        nationalPartOfCurrentPhone = currentFullPhoneVal.replace(/\D/g,'');
    }
    
    const newlyFormattedPhone = formatPhoneNumber(nationalPartOfCurrentPhone, newTargetPhonePrefix);

    if (currentFullPhoneVal !== newlyFormattedPhone) {
         setValue('contactNo', newlyFormattedPhone, { shouldValidate: true });
    }
    
  }, [watchedVendorType, watchedCountry, customCountryCode, setValue, watch]);

  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) return countries;
    const lowerSearchTerm = countrySearchTerm.toLowerCase();
    return countries.filter(country =>
        country.name.toLowerCase().includes(lowerSearchTerm) ||
        country.countryCode.includes(lowerSearchTerm) // Search by dial code too
    );
  }, [countrySearchTerm]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gray-50 to-blue-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-blue-950/30">
      <Header />
      {/* ... Hero Section ... */}
      <motion.section
        className="pt-48 pb-32 relative isolate overflow-hidden"
        initial="hidden"
        animate={heroControls}
        variants={staggerContainer}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        aria-labelledby="vendor-registration-heading"
      >
        {/* Background Elements */}
        <div className="absolute inset-0 z-[-10] opacity-50">
            {/* Subtle Grid Pattern */}
            <svg className="absolute inset-0 h-full w-full stroke-gray-300/30 dark:stroke-neutral-700/30 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]" aria-hidden="true">
            <defs>
                <pattern id="hero-pattern" width="80" height="80" x="50%" y="-1" patternUnits="userSpaceOnUse">
                <path d="M.5 200V.5H200" fill="none"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)"/>
            </svg>
            {/* Gradient Shapes */}
            <div className="absolute -right-[15%] top-[5%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-rashmi-red/15 via-rashmi-red/5 to-transparent blur-3xl opacity-70 parallax-bg" data-speed="-0.2"></div>
            <div className="absolute -left-[10%] bottom-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-blue-500/15 via-blue-500/5 to-transparent blur-3xl opacity-60 parallax-bg" data-speed="0.15"></div>
            {/* Main Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background z-[-5]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              {/* Enhanced Breadcrumb */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center text-sm text-muted-foreground/80 mb-6 self-start w-full"
            >
              <Link to="/" className="hover:text-rashmi-red transition-colors duration-200 group flex items-center gap-1" aria-label="Return to homepage">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home text-muted-foreground/60 group-hover:text-rashmi-red transition-colors"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Home
              </Link>
              <ChevronRight className="mx-1.5 h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
              <span className="font-medium text-foreground">Vendor Profile Submission</span>
            </motion.div>

              {/* Main Title with Animated Reveal */}
            <div className="mb-6 overflow-hidden">
              <motion.h1
                id="vendor-registration-heading"
                className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tighter text-foreground leading-tight"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }} // Smoother ease
              >
                Share Your Profile, <br className="hidden md:block" /> Partner with <span className="text-rashmi-red relative inline-block px-2">
                    Rashmi
                    {/* Underline Effect */}
                    <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.7, delay: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                        className="absolute -bottom-2 left-0 w-full h-1.5 bg-rashmi-red/80 rounded-full origin-left"
                        aria-hidden="true"
                    ></motion.span>
                  </span> Metaliks.
              </motion.h1>
            </div>

              {/* Enhanced Description */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-6 leading-relaxed"
            >
              This is your digital window to share your company profile with us. Our procurement team will review your submission before proceeding with the formal vendor registration process.
            </motion.p>

            {/* Important Registration Note */}
            <motion.div
              variants={fadeInUp}
              className="w-full max-w-3xl mx-auto mb-10 mt-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-6 py-5 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-amber-500"></div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1.5">Important Notice</h4>
                  <p className="text-amber-700/90 dark:text-amber-300/90 text-sm leading-relaxed">
                    We do not charge any registration amount. Please avoid online transaction of money. Interested vendor/supplier can send company profile & details by courier or postal to above address or upload Company Profile online. You will be contacted by our central Procurement team (Corporate) directly.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced CTA Button */}
            <motion.div variants={fadeInUp}>
              <a
                href="#registration-form"
                className="group inline-flex items-center justify-center gap-2.5 py-3.5 px-8 bg-gradient-to-r from-rashmi-red to-red-700 text-white rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-rashmi-red/30 focus:outline-none focus:ring-4 focus:ring-rashmi-red/40 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
              >
                  {/* Shimmer Effect */}
                  <motion.span
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                    style={{ backgroundSize: '200% 100%' }}
                    variants={shimmerVariants}
                    initial="initial"
                    animate="animate"
                  ></motion.span>
                  <span className="relative z-10">Submit Your Profile</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5 relative z-10" />
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>


      <motion.section id="registration-form" className="py-24 relative isolate" /* ... */ >
        {/* ... */}
        <div className="container mx-auto px-4 relative">
          <AnimatePresence mode="wait" initial={false}>
            {isSubmitted ? (
              <motion.div key="success" /* ... Success state JSX ... */ >
                 {/* Enhanced Success State (contents as before) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="dashed-pattern-success" width="20" height="20" patternUnits="userSpaceOnUse"> {/* Unique ID */}
                                <path d="M 0 10 L 10 10 M 10 0 L 10 10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dashed-pattern-success)" className="text-green-500 dark:text-green-400"/>
                    </svg>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/30"
                >
                  <Check className="w-10 h-10 text-white stroke-[3]" />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold mb-4 text-emerald-800 dark:text-emerald-200 tracking-tight"
                >
                  Profile Submitted Successfully!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="text-muted-foreground dark:text-neutral-300 mb-10 leading-relaxed text-lg"
                >
                  Thank you for your interest! We've received your company profile and our procurement team will review your details. If your profile meets our requirements, we'll contact you to proceed with the formal vendor registration process.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setIsSubmitted(false)}
                    className="rounded-full px-8 py-3 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-600 focus:ring-emerald-500/30 transition-all duration-300 group flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-ccw opacity-70 group-hover:rotate-[-90deg] transition-transform"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                    Submit Another Profile
                  </Button>
                </motion.div>
                <div className="success-confetti">
                  {[...Array(25)].map((_, i) => ( <div key={i} className={`confetti-item confetti-item-${i % 5}`}></div> ))}
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Video Column (as before) */}
                <div className="lg:order-1 lg:sticky lg:top-24 flex flex-col items-center">
                  <div className="flex flex-col items-center bg-background/90 dark:bg-neutral-900/90 rounded-2xl p-4 border border-border/10 w-full max-w-sm mx-auto">
                    <div className="aspect-[9/16] w-full rounded-xl overflow-hidden shadow-xl mb-6">
                      <video autoPlay muted loop playsInline className="w-full h-full object-cover" aria-label="Business partnership and vendor registration process visualization" poster="https://res.cloudinary.com/dada5hjp3/image/upload/v1744700600/vendor-registration-poster.jpg" preload="metadata">
                        <source src="https://res.cloudinary.com/dada5hjp3/video/upload/v1744700600/0_Business_Agreement_1080x1920_tzq7hk.mp4" type="video/mp4"/>
                        <track kind="descriptions" srcLang="en" src="/lovable-uploads/captions/vendor-registration-desc.vtt" label="English descriptions"/>
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="text-center w-full">
                      <h3 className="text-2xl font-semibold text-foreground mb-2">Why Submit Your Profile?</h3>
                      <p className="text-muted-foreground">
                        Sharing your profile is the first step to potential business opportunities with <Link to="/" className="text-rashmi-red hover:underline">Rashmi Metaliks</Link>, the world's 2nd largest DI pipe manufacturer. Our procurement team reviews each submission to match vendors with our needs.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.div key="form" className="lg:order-2" /* ... */ >
                  <Card className="w-full overflow-hidden shadow-xl dark:shadow-blue-950/10 border border-border/40 dark:border-neutral-800/60 rounded-2xl bg-card/80 dark:bg-neutral-900/80 backdrop-blur-lg">
                    {/* ... CardHeader ... */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rashmi-red/80 via-blue-500/70 to-rashmi-red/80" aria-hidden="true"></div>
                    <CardHeader className="bg-muted/30 dark:bg-neutral-800/30 border-b border-border/30 dark:border-neutral-800/50 p-8">
                      <CardTitle id="form-heading" className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Submit your vendor profile</CardTitle>
                      <CardDescription className="text-base text-muted-foreground/90 mt-1">
                        Share your details to initiate the review process. Fields marked <span className="text-rashmi-red font-medium">*</span> are required.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10">
                      <form className="space-y-12" onSubmit={handleSubmit(onSubmit)} noValidate >
                        {/* ... Contact Person Details ... */}
                        <div className="space-y-6">
                          <SectionHeader icon={User} title="Contact Person Details" description="Primary contact for communication" />
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                            <FormField label="Full Name" required id="name" error={errors.name?.message}>
                              <Input id="name" placeholder="e.g., John Smith" className="bg-background/70" {...register("name", { required: "Full name is required" })} aria-invalid={errors.name ? "true" : "false"}/>
                            </FormField>
                            <FormField label="Designation" required id="designation" error={errors.designation?.message}>
                              <Input id="designation" placeholder="e.g., Procurement Manager" className="bg-background/70" {...register("designation", { required: "Designation is required" })} aria-invalid={errors.designation ? "true" : "false"} />
                            </FormField>
                          </div>
                        </div>
                        {/* ... Company Information ... */}
                         <div className="space-y-6">
                          <SectionHeader icon={Building} title="Company Information" description="Details about your organization" />
                          <FormField label="Company/Firm Name" required id="companyName" error={errors.companyName?.message}>
                            <Input id="companyName" placeholder="Your company's registered name" className="bg-background/70" {...register("companyName", { required: "Company name is required" })} aria-invalid={errors.companyName ? "true" : "false"} />
                          </FormField>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                            <FormField label="Type of Firm" required id="firmType" error={errors.firmType?.message}>
                              <Controller name="firmType" control={control} rules={{ required: "Please select a firm type" }}
                                render={({ field }) => (
                                  <Select onValueChange={field.onChange} value={field.value || ""} >
                                    <SelectTrigger id="firmType-select" aria-invalid={errors.firmType ? "true" : "false"} className="bg-background/70">
                                      <SelectValue placeholder="Select firm type..." />
                                    </SelectTrigger>
                                    <SelectContent>{firmTypes.map(type => (<SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>))}</SelectContent>
                                  </Select>
                                )}
                              />
                            </FormField>
                            <FormField label="Company Website" id="website" error={errors.website?.message}>
                              <Input id="website" type="url" placeholder="https://example.com" className="bg-background/70"
                                {...register("website", { pattern: { value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, message: "Invalid website URL" }})}
                                aria-invalid={errors.website ? "true" : "false"}
                              />
                            </FormField>
                          </div>
                          <div className="space-y-5">
                            {/* Vendor Type Switch */}
                            <FormField label="Vendor Type" required id="vendorTypeField" error={errors.vendorType?.message} className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4 bg-muted/30">
                              <div className="space-y-0.5">
                                <Label htmlFor="vendorTypeSwitch" className="text-base">{watchedVendorType === 'domestic' ? 'Domestic Vendor (India)' : 'Global Vendor'}</Label>
                                <p className="text-sm text-muted-foreground">{watchedVendorType === 'domestic' ? 'For vendors based in India' : 'For international vendors'}</p>
                              </div>
                              <Controller name="vendorType" control={control} rules={{ required: "Vendor type is required" }}
                                render={({ field }) => (
                                  <Switch id="vendorTypeSwitch" checked={field.value === 'global'}
                                    onCheckedChange={(checked) => {
                                      const newVendorType = checked ? 'global' : 'domestic';
                                      field.onChange(newVendorType);
                                      // setValue('contactNo',''); // Let useEffect handle this.
                                      if (newVendorType === 'domestic') {
                                        setValue('country', 'in', { shouldValidate: true });
                                      } else if (watch('country') === 'in') {
                                        const usCountry = countries.find(c => c.code === 'us');
                                        setValue('country', usCountry?.code || '', { shouldValidate: true });
                                      }
                                    }}
                                    className="data-[state=checked]:bg-blue-600"
                                  />
                                )}
                              />
                            </FormField>
                            {/* Country Select */}
                            <FormField label="Country" required id="country" error={errors.country?.message}>
                              <Controller name="country" control={control} rules={{ required: "Country is required" }}
                                render={({ field }) => (
                                  <div className="relative">
                                    <Select
                                      onValueChange={(value) => {
                                        field.onChange(value);
                                        if (value !== 'others') { setCustomCountry(''); setCustomCountryCode(''); }
                                        setCountrySearchTerm(''); // Reset search on select
                                        trigger("contactNo");
                                      }}
                                      value={field.value || ""}
                                      disabled={isDomestic}
                                    >
                                      <SelectTrigger id="country-select-trigger" aria-invalid={errors.country ? "true" : "false"} className={cn("bg-background/70", isDomestic && "opacity-70 cursor-not-allowed")}>
                                        <div className="flex items-center gap-2">
                                          {field.value && field.value !== 'others' && (<span className="inline-block w-5 text-center">{ {'in': '🇮🇳', 'us': '🇺🇸', 'gb': '🇬🇧', 'ca': '🇨🇦', 'au': '🇦🇺', 'jp': '🇯🇵', 'cn': '🇨🇳', 'de': '🇩🇪'}[field.value] || '🌍'}</span>)}
                                          <SelectValue placeholder="Select country..." />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent className="max-h-80">
                                        <div className="p-2 sticky top-0 bg-background z-10 border-b -mx-1 -mt-1"> {/* Negative margin to fill SelectContent padding */}
                                          <Input placeholder="Search country..." value={countrySearchTerm} onChange={(e) => setCountrySearchTerm(e.target.value)} className="bg-muted/50 h-9" aria-label="Search countries"/>
                                        </div>
                                        <div className="pt-1 overflow-y-auto" style={{maxHeight: 'calc(20rem - 3rem)'}}> {/* Adjust maxHeight if needed */}
                                          {filteredCountries.length > 0 ? filteredCountries.map(country => (
                                            <SelectItem key={country.code} value={country.code} data-country-name={country.name} className="cursor-pointer py-2">
                                              <div className="flex items-center justify-between w-full">
                                                <span>{country.name}</span>
                                                {country.code !== 'others' && <span className="text-xs text-muted-foreground">{country.countryCode}</span>}
                                              </div>
                                            </SelectItem>
                                          )) : <p className="p-2 text-sm text-muted-foreground text-center">No countries found.</p>}
                                        </div>
                                      </SelectContent>
                                    </Select>
                                    {isDomestic && (<div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground text-xs pointer-events-none">India Only</div>)}
                                  </div>
                                )}
                              />
                              {isOtherCountrySelected && (
                                <div className="mt-3 space-y-3">
                                  <Input placeholder="Enter your country name" value={customCountry} onChange={e => { setCustomCountry(e.target.value); trigger("contactNo"); }} className="bg-background/70"/>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground select-none">+</span>
                                    <Input placeholder="Dial code (e.g., 975)" value={customCountryCode.replace(/^\+/, '')}
                                      onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setCustomCountryCode(val ? `+${val}` : '');
                                        trigger("contactNo");
                                      }}
                                      className="bg-background/70 pl-7" type="tel" maxLength={4}
                                    />
                                  </div>
                                </div>
                              )}
                               {!errors.country && !isDomestic && ( <p className="text-xs text-muted-foreground mt-1">Select country or "Others".</p>)}
                            </FormField>
                            {/* GST Number */}
                            {isDomestic && (
                              <FormField label="GST Number (Optional)" id="gstNumber" error={errors.gstNumber?.message}>
                                <div className="relative">
                                  <Input id="gstNumber" placeholder="e.g., 22AAAAA0000A1Z5" className="bg-background/70 uppercase"
                                    {...register("gstNumber", { pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: "Invalid GST Number format"}})}
                                    aria-invalid={errors.gstNumber ? "true" : "false"} maxLength={15} onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-background/90 px-1 rounded">15 chars</div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Helps expedite verification.</p>
                              </FormField>
                            )}
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-6">
                          <SectionHeader icon={Phone} title="Contact Details" description="How we can reach you" />
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
                            <FormField label="Contact Number" required id="contactNo" error={errors.contactNo?.message}>
                              <div className="relative">
                                {shouldShowCountryCodeBadge && (
                                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 select-none">
                                    <span className="bg-muted/80 text-muted-foreground rounded px-1.5 py-0.5 text-xs font-medium">
                                      {activeDialCode}
                                    </span>
                                  </div>
                                )}
                                <Input
                                  id="contactNoInput" // Different ID from FormField to avoid label conflict if any
                                  type="tel"
                                  placeholder={contactPlaceholder}
                                  className={cn(
                                    "bg-background/70",
                                    shouldShowCountryCodeBadge && "pl-[calc(0.75rem+2.5rem+0.5rem)]" // Adjust padding: base + badge width + space
                                  )}
                                  value={contactNoDisplayValue} // Display transformed value
                                  onChange={handleContactNoInputChange} // Custom handler
                                  onBlur={() => trigger("contactNo")} // Trigger validation on blur
                                  aria-invalid={errors.contactNo ? "true" : "false"}
                                />
                                {/* Hidden input for react-hook-form register to capture the full number for validation logic if needed, though setValue is primary */}
                                <input type="hidden" {...register("contactNo", {
                                     required: "Contact number is required",
                                     validate: (value) => validatePhoneNumber(value, activeDialCode) || `Invalid phone for ${countries.find(c => c.countryCode === activeDialCode)?.name || 'selected region'}.`
                                 })} />
                              </div>
                               {!errors.contactNo && (<p className="text-xs text-muted-foreground mt-1">{isDomestic ? '10-digit mobile.' : 'Enter national number.'}</p>)}
                            </FormField>
                            <FormField label="Email Address" required id="email" error={errors.email?.message}>
                              <Input id="email" type="email" placeholder="contact@yourcompany.com" className="bg-background/70"
                                {...register("email", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email format"}})}
                                aria-invalid={errors.email ? "true" : "false"}
                              />
                            </FormField>
                          </div>
                        </div>
                        
                        {/* ... Product/Service Information, File Upload, Terms, Submit Button ... (largely as before) */}
                        <div className="space-y-6">
                          <SectionHeader icon={Briefcase} title="Product/Service Information" description="Details about what you offer" />
                          <FormField label="Primary Category" required id="category" error={errors.category?.message}>
                            <Controller name="category" control={control} rules={{ required: "Please select a category" }}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <SelectTrigger id="category-select-trigger" aria-invalid={errors.category ? "true" : "false"} className="bg-background/70">
                                    <SelectValue placeholder="Select primary category..." />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-80">{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>))}</SelectContent>
                                </Select>
                              )}
                            />
                          </FormField>
                          <FormField label="Product/Service Description" required id="productDescription" error={errors.productDescription?.message}>
                            <Textarea id="productDescription" rows={4} placeholder="Describe your core offerings..." className="bg-background/70 resize-y"
                              {...register("productDescription", { required: "Description is required", minLength: { value: 20, message: "Min 20 chars." }})}
                              aria-invalid={errors.productDescription ? "true" : "false"}
                            />
                          </FormField>
                          <FormField label="Major Clients or Projects (Optional)" id="majorClients" error={errors.majorClients?.message}>
                            <Textarea id="majorClients" rows={3} placeholder="List key clients, projects..." className="bg-background/70 resize-y" {...register("majorClients")} />
                          </FormField>
                          <div className="mt-6">
                            <FormField label="Last Year Turnover" required id="turnoverField" error={errors.turnover?.message || errors.turnoverCurrency?.message}>
                              <div className="flex items-center gap-3">
                                <div className="flex-1">
                                  <Input id="turnover" type="number" step="0.01" inputMode="decimal" placeholder="Enter turnover value" className="bg-background/70"
                                    {...register("turnover", { required: "Turnover value is required", valueAsNumber: true, min: { value: 0, message: "Must be positive" }})}
                                    aria-invalid={errors.turnover ? "true" : "false"}
                                  />
                                </div>
                                <div className="w-40">
                                  <Controller name="turnoverCurrency" control={control} rules={{ required: "Currency is required" }}
                                    render={({ field }) => (
                                      <Select onValueChange={field.onChange} value={field.value || "INR"}>
                                        <SelectTrigger id="turnoverCurrency-select" className="bg-background/70"><SelectValue placeholder="Currency" /></SelectTrigger>
                                        <SelectContent><SelectItem value="INR">Rs (in Cr)</SelectItem><SelectItem value="USD">USD (in Million)</SelectItem></SelectContent>
                                      </Select>
                                    )}
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{watch('turnoverCurrency') === 'INR' ? 'Value in Crores (e.g., 10.5)' : 'Value in Millions (e.g., 2.5)'}</p>
                            </FormField>
                          </div>
                        </div>

                        <div className="space-y-3 pt-4">
                          <Label htmlFor="file-upload-label" className="flex items-center text-lg font-semibold text-foreground tracking-tight"><Upload className="mr-2 h-5 w-5 text-rashmi-red" />Supporting Documents (Optional)</Label>
                          <p className="text-sm text-muted-foreground/90 mb-3">Upload up to 3 files (PDF/Word, Max {MAX_FILE_SIZE_MB}MB each)</p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">{files.length > 0 ? `${files.length} of 3 files selected` : 'No files selected'}</span>
                            {files.length > 0 && (<Button type="button" variant="ghost" size="sm" onClick={clearAllFiles} className="text-sm text-muted-foreground hover:text-destructive" disabled={isSubmitting}>Clear all</Button>)}
                          </div>
                          <div className={cn( "relative flex flex-col items-center justify-center w-full min-h-[12rem] border-2 border-dashed rounded-xl cursor-pointer transition-all group", isDragging ? "border-rashmi-red bg-rashmi-red/10 scale-[1.02]" : "border-border/60 hover:border-rashmi-red/50 hover:bg-muted/30 bg-muted/20", fileErrors.some(e=>!e.startsWith("Maximum 3 files")) ? "border-destructive bg-destructive/10" : "", files.length > 0 || isSubmitting ? "border-solid" : "" )}
                            onDrop={handleFileDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => files.length < 3 && document.getElementById('file-upload')?.click()} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') { files.length < 3 && document.getElementById('file-upload')?.click();}}} aria-labelledby="file-upload-label"
                          >
                            <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} accept={ALLOWED_FILE_TYPES.join(',')} disabled={files.length >= 3 || isSubmitting}/>
                            {files.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full p-4">
                                {files.map((file, index) => (
                                  <div key={file.name + index} className="relative flex flex-col items-center p-3 bg-card/90 backdrop-blur-sm rounded-lg border border-border/30">
                                    <div className="mb-2 w-full h-24 flex items-center justify-center"><FileText className="h-10 w-10 text-rashmi-red/80" /></div>
                                    <div className="text-center w-full"><p className="text-xs font-medium text-foreground truncate max-w-full px-1" title={fileNames[index]}>{fileNames[index]}</p><p className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
                                    <Button type="button" variant="ghost" size="icon" onClick={(e) => clearFile(index, e)} className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full bg-card/90 border hover:bg-destructive/10 hover:text-destructive" disabled={isSubmitting} aria-label={`Remove ${fileNames[index]}`}><X size={14} /></Button>
                                  </div>
                                ))}
                                {files.length < 3 && (
                                  <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg border border-dashed cursor-pointer hover:bg-muted/50 min-h-[10rem]" onClick={() => document.getElementById('file-upload')?.click()} role="button" tabIndex={0} onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('file-upload')?.click();}} aria-label="Add more files">
                                    <Plus className="h-10 w-10 text-muted-foreground/50 mb-2" /><p className="text-xs text-muted-foreground">Add file</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-center p-6 flex flex-col items-center justify-center">
                                <Upload className={cn("h-14 w-14 mb-4", isDragging ? "text-rashmi-red" : "text-muted-foreground/60")} />
                                <p className="font-semibold text-lg text-foreground">{isDragging ? "Drop files here!" : <><span className="text-rashmi-red">Click to upload</span> or drag & drop</>}</p>
                                <p className="text-xs text-muted-foreground mt-1.5">PDF or Word (up to 3 files)</p>
                              </div>
                            )}
                            {isSubmitting && uploadProgress > 0 && ( /* Upload Progress Overlay ... */ <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-xl p-4"><div className="w-full max-w-xs text-center"><Loader2 className="h-8 w-8 text-rashmi-red animate-spin mx-auto mb-3" /><p className="text-sm font-medium text-foreground mb-2">Uploading...</p><Progress value={uploadProgress} className="h-2" /><p className="text-xs text-muted-foreground mt-1">{Math.min(uploadProgress,100)}%</p></div></div>)}
                          </div>
                          {fileErrors.length > 0 && (<div className="mt-3 space-y-1">{fileErrors.map((error, index) => (<p key={index} className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle size={14} />{error}</p>))}<Button type="button" variant="link" size="sm" onClick={() => setFileErrors([])} className="text-xs text-muted-foreground mt-1 hover:text-destructive p-0 h-auto">Clear errors</Button></div>)}
                        </div>

                        <div className="pt-6 space-y-8">
                          <div className="flex items-start space-x-3 rounded-lg border border-border/50 p-4 bg-muted/20">
                            <Controller name="terms" control={control} rules={{ required: "You must agree to the terms" }}
                              render={({ field }) => (
                                <Checkbox id="terms-checkbox" checked={field.value} onCheckedChange={field.onChange} aria-invalid={errors.terms ? "true" : "false"} className={cn("mt-0.5 data-[state=checked]:bg-rashmi-red data-[state=checked]:border-rashmi-red", errors.terms ? "border-destructive" : "border-muted-foreground/50")}/>
                              )}
                            />
                            <div className="grid gap-1.5 leading-none flex-1">
                              <Label htmlFor="terms-checkbox" className="text-sm font-medium text-foreground/90 cursor-pointer">I confirm all information is accurate and consent to having my profile reviewed for potential vendor registration.<span className="text-destructive">*</span></Label>
                              {errors.terms && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={13} />{errors.terms.message}</p>}
                            </div>
                          </div>
                          <Button type="submit" className="w-full bg-gradient-to-r from-rashmi-red to-red-700 hover:from-rashmi-red/90 hover:to-red-700/90 text-white py-6 text-lg font-semibold rounded-xl shadow-md hover:shadow-lg" disabled={isSubmitting || (Object.keys(errors).length > 0 && !errors.terms)}>
                            {isSubmitting ? (<span className="flex items-center justify-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</span>) : (<span className="flex items-center justify-center">Submit Profile <Check className="ml-2 h-5 w-5" /></span>)}
                          </Button>
                        </div>

                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ... Benefits Section ... (as before) */}
      <section
        className="py-24 relative bg-gradient-to-b from-blue-50/20 to-background dark:from-blue-950/20 dark:to-neutral-950 overflow-hidden"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
        aria-labelledby="benefits-heading"
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <div className="absolute -right-[5%] top-[10%] w-1/3 h-1/2 bg-rashmi-red/5 dark:bg-rashmi-red/10 rounded-full blur-3xl opacity-50 parallax-bg" data-speed="0.1"></div>
          <div className="absolute -left-[10%] bottom-[5%] w-1/2 h-1/2 bg-blue-500/5 dark:bg-blue-900/10 rounded-full blur-3xl opacity-40 parallax-bg" data-speed="-0.15"></div>
          <svg className="absolute inset-0 h-full w-full stroke-gray-300/20 dark:stroke-neutral-700/20 [mask-image:radial-gradient(100%_100%_at_center_center,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="benefits-pattern-unique" width="60" height="60" x="50%" y="-1" patternUnits="userSpaceOnUse"> {/* Unique ID */}
                <path d="M.5 60 V.5 H60" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth="0" fill="url(#benefits-pattern-unique)"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-3">
              <span className="inline-block bg-rashmi-red/10 text-rashmi-red px-3 py-1 rounded-full text-sm font-medium tracking-wide">
                Review Process
              </span>
            </motion.div>
            <motion.h2
              id="benefits-heading"
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-foreground"
            >
              Why Submit Your Profile?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-muted-foreground/90 dark:text-neutral-300 leading-relaxed">
              Your profile submission is the first step towards becoming a registered vendor with <Link to="/" className="text-rashmi-red hover:underline">Rashmi Metaliks</Link>, the world's 2nd largest <Link to="/di-pipes" className="text-rashmi-red hover:underline">DI pipe manufacturer</Link>. Our procurement team carefully reviews each submission to ensure alignment with our quality standards and business needs.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: "Expand Your Reach", description: "Access new markets and large-scale projects through our extensive network and ongoing tenders for ductile iron pipes and infrastructure projects.", icon: TrendingUp, color: "from-blue-500/10 to-blue-600/5 dark:from-blue-800/20 dark:to-blue-900/10", ariaLabel: "Expand market reach" },
              { title: "Streamlined Procurement", description: "Experience efficient digital processes, clear communication, and a dedicated vendor portal with our world-class procurement team.", icon: CheckCircle, color: "from-rashmi-red/10 to-red-600/5 dark:from-rashmi-red/20 dark:to-red-900/10", ariaLabel: "Streamlined procurement" },
              { title: "Reliable & Timely Payments", description: "Benefit from structured payment cycles and financial predictability with Rashmi Metaliks, fostering a stable partnership for long-term growth.", icon: ShieldCheck, color: "from-emerald-500/10 to-green-600/5 dark:from-emerald-800/20 dark:to-green-900/10", ariaLabel: "Reliable payments" },
              { title: "Long-Term Growth", description: "Become a preferred partner and scale your business alongside our expanding operations and projects in the steel and iron industry.", icon: Award, color: "from-amber-500/10 to-yellow-600/5 dark:from-amber-800/20 dark:to-yellow-900/10", ariaLabel: "Long-term growth" },
              { title: "Innovation Synergy", description: "Collaborate on new steel and iron solutions, gain early access to requirements, and contribute to DI pipe and infrastructure advancements.", icon: Upload /* Globe or Lightbulb might be better */, color: "from-indigo-500/10 to-purple-600/5 dark:from-indigo-800/20 dark:to-purple-900/10", ariaLabel: "Innovation synergy" },
              { title: "Sustainable Partnership", description: "Align with our commitment to responsible sourcing, ethical practices, and environmental stewardship in the metals manufacturing industry.", icon: Globe /* ShieldCheck or CheckCircle also fit */, color: "from-teal-500/10 to-cyan-600/5 dark:from-teal-800/20 dark:to-cyan-900/10", ariaLabel: "Sustainable partnership" }
            ].map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
                  className="bg-card/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-border/30 dark:border-neutral-700/50 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 group"
                  aria-labelledby={`benefit-title-${index}`}
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl ${benefit.color} rounded-full blur-3xl -z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300`} aria-hidden="true"></div>
                  <div className="p-6 pb-8 flex-grow relative z-10 flex flex-col">
                    <div
                      className="mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-background to-muted/60 dark:from-neutral-700 dark:to-neutral-800/50 shadow-md border border-border/20 dark:border-neutral-600/50"
                      aria-hidden="true" 
                    >
                      <BenefitIcon className="h-7 w-7 text-rashmi-red" />
                    </div>
                    <h3 id={`benefit-title-${index}`} className="text-xl font-semibold mb-2.5 text-foreground dark:text-neutral-100">{benefit.title}</h3>
                    <p className="text-muted-foreground dark:text-neutral-300 text-sm leading-relaxed flex-grow">{benefit.description}</p>
                    <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-rashmi-red/40 via-border/50 to-transparent" aria-hidden="true"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-16"
          >
            <a
              href="#registration-form"
              className="inline-flex items-center justify-center gap-2 py-3 px-7 bg-background/80 dark:bg-neutral-800/80 text-foreground border border-border/50 dark:border-neutral-700 rounded-full hover:border-rashmi-red/60 hover:text-rashmi-red dark:hover:border-rashmi-red/70 dark:hover:text-rashmi-red backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
              aria-label="Return to registration form"
            >
              Ready to Partner? Register Now
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </section>

      <style>{`
        /* ... (CSS styles as before, ensure Radix popper z-index is high) ... */
        :root {
          --font-display: 'Lexend', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        body {
            font-family: var(--font-sans);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        h1, h2, h3, .font-display {
            font-family: var(--font-display);
        }

        .parallax-bg {
          will-change: transform;
          transform: translateZ(0); 
          backface-visibility: hidden; 
        }

        .success-confetti {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; overflow: hidden; z-index: 20;
        }
        .confetti-item {
          position: absolute;
          width: 8px; height: 12px;
          border-radius: 2px;
          opacity: 0;
          animation: confetti-fall 3.5s ease-in-out forwards;
          transform-origin: center;
        }
        @keyframes confetti-fall {
          0% {
            transform: translateY(-150px) rotate(0deg) scale(1.2); 
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 150px)) rotate(720deg) scale(0.5); 
            opacity: 0;
          }
        }
        .confetti-item-0 { left: 10%; background-color: #EF4444; animation-delay: 0.1s; animation-duration: 3s; }
        .confetti-item-1 { left: 25%; background-color: #3B82F6; animation-delay: 0.4s; animation-duration: 3.8s; }
        .confetti-item-2 { left: 45%; background-color: #10B981; animation-delay: 0.2s; animation-duration: 3.2s; }
        .confetti-item-3 { left: 65%; background-color: #F59E0B; animation-delay: 0.6s; animation-duration: 4s; }
        .confetti-item-4 { left: 85%; background-color: #8B5CF6; animation-delay: 0.3s; animation-duration: 3.5s; }
        .confetti-item:nth-child(5n+1) { left: 15%; animation-delay: 0.5s; background-color: #EC4899; transform: rotate(15deg); }
        .confetti-item:nth-child(5n+2) { left: 35%; animation-delay: 0.7s; background-color: #6366F1; transform: rotate(-10deg); }
        .confetti-item:nth-child(5n+3) { left: 55%; animation-delay: 0.9s; background-color: #22C55E; transform: rotate(25deg); }
        .confetti-item:nth-child(5n+4) { left: 75%; animation-delay: 0.15s; background-color: #F97316; transform: rotate(-15deg); }
        .confetti-item:nth-child(5n+5) { left: 95%; animation-delay: 0.55s; background-color: #0EA5E9; transform: rotate(5deg); }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: hsl(var(--background) / 0.1); }
        ::-webkit-scrollbar-thumb { background-color: hsl(var(--border) / 0.5); border-radius: 10px; border: 2px solid transparent; background-clip: content-box; }
        ::-webkit-scrollbar-thumb:hover { background-color: hsl(var(--border)); }
        
        [data-radix-popper-content-wrapper] {
            z-index: 9999 !important;
        }
      `}</style>
      <Footer />
    </div>
  );
};

export default VendorRegistration;