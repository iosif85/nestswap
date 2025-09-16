import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  type: z.enum(['caravan', 'cabin', 'motorhome', 'tent', 'other']),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200),
  city: z.string().min(1, 'City is required').max(100),
  country: z.string().min(1, 'Country is required').max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  maxGuests: z.number().min(1).max(50),
  bedrooms: z.number().min(0).max(20),
  bathrooms: z.number().min(0).max(10),
  houseRules: z.string().optional(),
});

type CreateListingForm = z.infer<typeof createListingSchema>;

const PROPERTY_TYPES = [
  { value: 'caravan', label: 'Caravan' },
  { value: 'cabin', label: 'Cabin' },
  { value: 'motorhome', label: 'Motorhome' },
  { value: 'tent', label: 'Tent' },
  { value: 'other', label: 'Other' },
];

const AMENITIES_OPTIONS = [
  'WiFi', 'Kitchen', 'Parking', 'Hot Tub', 'BBQ', 'Fire Pit',
  'Air Conditioning', 'Heating', 'Washer', 'Dryer', 'TV',
  'Workspace', 'Pool', 'Gym', 'Pet Friendly', 'Family Friendly',
  'Wheelchair Accessible', 'Smoking Allowed', 'Events Allowed'
];

export default function CreateListingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<Array<{ url: string; caption?: string }>>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'caravan',
      address: '',
      city: '',
      country: 'UK',
      latitude: 0,
      longitude: 0,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      houseRules: '',
    },
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: CreateListingForm & { amenities: string[]; photos: Array<{ url: string; caption?: string }> }) => {
      const response = await apiRequest('POST', '/api/listings', data);
      return response.json();
    },
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me/listings'] });
      toast({
        title: 'Success!',
        description: 'Your listing has been created successfully.',
      });
      setLocation(`/listings/${listing.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateListingForm) => {
    createListingMutation.mutate({
      ...data,
      amenities: selectedAmenities,
      photos,
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const addPhoto = () => {
    const url = prompt('Enter photo URL:');
    if (url) {
      setPhotos(prev => [...prev, { url }]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getLocationFromAddress = async () => {
    const address = form.getValues('address');
    if (!address) {
      toast({
        title: 'Error',
        description: 'Please enter an address first.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // This is a simplified example - in production you'd use a proper geocoding service
      toast({
        title: 'Info',
        description: 'Please manually enter coordinates. Geocoding service integration needed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get coordinates from address.',
        variant: 'destructive',
      });
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Listing</h1>
            <p className="text-muted-foreground">Share your property with the NestSwap community</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`h-px w-20 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cozy cabin in the mountains"
                            data-testid="input-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property, its amenities, and what makes it special..."
                            rows={5}
                            data-testid="textarea-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="123 Mountain View Road, Lake District"
                              data-testid="input-address"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={getLocationFromAddress}
                              data-testid="button-get-coordinates"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Lake District"
                              data-testid="input-city"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="United Kingdom"
                              data-testid="input-country"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="54.4609"
                              data-testid="input-latitude"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="-3.0886"
                              data-testid="input-longitude"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxGuests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Guests</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              data-testid="input-max-guests"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              data-testid="input-bedrooms"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              data-testid="input-bathrooms"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <FormLabel>Amenities</FormLabel>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {AMENITIES_OPTIONS.map(amenity => (
                        <Button
                          key={amenity}
                          type="button"
                          variant={selectedAmenities.includes(amenity) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleAmenity(amenity)}
                          data-testid={`amenity-${amenity.toLowerCase().replace(' ', '-')}`}
                        >
                          {amenity}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="houseRules"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Rules (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="No smoking, no pets, quiet hours after 10pm..."
                            rows={3}
                            data-testid="textarea-house-rules"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo.url}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removePhoto(index)}
                            data-testid={`button-remove-photo-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        className="h-32 border-dashed"
                        onClick={addPhoto}
                        data-testid="button-add-photo"
                      >
                        <Upload className="h-6 w-6 mr-2" />
                        Add Photo
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Add photos to showcase your property. At least one photo is recommended.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                data-testid="button-previous"
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={createListingMutation.isPending}
                  data-testid="button-create-listing"
                >
                  {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}