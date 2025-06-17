
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { ChildProfile, CreateChildProfileData } from '@/types/child-profiles';
import { useStorage } from '@/hooks/storage/useStorage';
import { toast } from '@/components/ui/use-toast';

interface ChildProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateChildProfileData) => Promise<void>;
  childProfile?: ChildProfile;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function ChildProfileDialog({
  open,
  onOpenChange,
  onSubmit,
  childProfile,
  isEditing = false,
  isSubmitting = false
}: ChildProfileDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateChildProfileData>({
    defaultValues: {
      name: '',
      age: undefined,
      avatar_url: ''
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, getPublicUrl } = useStorage();

  const watchedAvatarUrl = watch('avatar_url');

  // Reset form data when dialog opens or childProfile changes
  useEffect(() => {
    if (open) {
      if (isEditing && childProfile) {
        // Reset form with existing child data
        reset({
          name: childProfile.name || '',
          age: childProfile.age || undefined,
          avatar_url: childProfile.avatar_url || ''
        });
        setPreviewUrl(childProfile.avatar_url || '');
      } else {
        // Reset form to empty for new child
        reset({
          name: '',
          age: undefined,
          avatar_url: ''
        });
        setPreviewUrl('');
      }
    }
  }, [open, isEditing, childProfile, reset]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `child-avatars/${fileName}`;

      // Upload to Supabase storage
      await uploadFile('avatars', filePath, file);
      
      // Get the public URL
      const publicUrl = getPublicUrl('avatars', filePath);
      
      // Update form and preview
      setValue('avatar_url', publicUrl);
      setPreviewUrl(publicUrl);
      
      toast({
        title: "Photo uploaded",
        description: "Child's photo has been uploaded successfully."
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setValue('avatar_url', '');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getChildInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFormSubmit = async (data: CreateChildProfileData) => {
    try {
      await onSubmit(data);
      reset();
      setPreviewUrl('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const displayUrl = previewUrl || watchedAvatarUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Child Profile' : 'Add Child Profile'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the child\'s information.' 
              : 'Add a child to your household. Children don\'t need login accounts.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Photo Upload Section */}
          <div className="space-y-3">
            <Label>Photo</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={displayUrl} alt="Child photo" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                  {getChildInitials(watch('name') || '')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-9"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-pulse" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      {displayUrl ? 'Change Photo' : 'Add Photo'}
                    </>
                  )}
                </Button>
                
                {displayUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removePhoto}
                    className="h-9 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Child's name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="0"
              max="18"
              {...register('age', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Age must be positive' },
                max: { value: 18, message: 'Age must be 18 or under' }
              })}
              placeholder="Child's age"
            />
            {errors.age && (
              <p className="text-sm text-destructive">{errors.age.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar_url">Avatar URL (optional)</Label>
            <Input
              id="avatar_url"
              type="url"
              {...register('avatar_url')}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-muted-foreground">
              You can also upload a photo above or paste an image URL here
            </p>
            {errors.avatar_url && (
              <p className="text-sm text-destructive">{errors.avatar_url.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add Child')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
