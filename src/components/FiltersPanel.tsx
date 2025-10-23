'use client'

import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Checkbox,
  CheckboxGroup,
  Stack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Button,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  HStack,
} from '@chakra-ui/react'

interface FiltersPanelProps {
  categories?: Array<{ id: string; name: string; slug: string }>
  onFiltersChange?: (filters: FilterState) => void
  maxPrice?: number
  minPrice?: number
}

export interface FilterState {
  categories: string[]
  priceRange: [number, number]
  caratRange: [number, number]
  inStock: boolean
}

export default function FiltersPanel({
  categories = [],
  onFiltersChange,
  maxPrice = 10000000,
  minPrice = 0,
}: FiltersPanelProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    categories: [],
    priceRange: [minPrice, maxPrice],
    caratRange: [0, 10],
    inStock: false,
  })

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

  const handleCategoryChange = (categories: string | string[]) => {
    const categoryArray = Array.isArray(categories) ? categories : [categories]
    setSelectedCategories(categoryArray)
    const newFilters = { ...filters, categories: categoryArray }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handlePriceChange = (values: number[]) => {
    const newFilters = { ...filters, priceRange: [values[0], values[1]] as [number, number] }
    setFilters(newFilters)
  }

  const handlePriceChangeEnd = (values: number[]) => {
    const newFilters = { ...filters, priceRange: [values[0], values[1]] as [number, number] }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleCaratChange = (values: number[]) => {
    const newFilters = { ...filters, caratRange: [values[0], values[1]] as [number, number] }
    setFilters(newFilters)
  }

  const handleCaratChangeEnd = (values: number[]) => {
    const newFilters = { ...filters, caratRange: [values[0], values[1]] as [number, number] }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, inStock: e.target.checked }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const clearFilters = () => {
    const newFilters: FilterState = {
      categories: [],
      priceRange: [minPrice, maxPrice],
      caratRange: [0, 10],
      inStock: false,
    }
    setFilters(newFilters)
    setSelectedCategories([])
    onFiltersChange?.(newFilters)
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] !== minPrice ||
    filters.priceRange[1] !== maxPrice ||
    filters.caratRange[0] !== 0 ||
    filters.caratRange[1] !== 10 ||
    filters.inStock

  return (
    <Box bg="transparent" p={6} borderRadius="lg" border="2px solid" borderColor="gold.500">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md" color="gold.500">Filters</Heading>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters} color="gold.500" _hover={{ bg: "rgba(212, 175, 55, 0.1)" }}>
              Clear all
            </Button>
          )}
        </HStack>

        <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
          {/* Categories Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="300" color="white">Categories</Text>
              </Box>
              <AccordionIcon color="gold.500" />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <CheckboxGroup value={selectedCategories} onChange={handleCategoryChange}>
                <Stack spacing={2}>
                  {categories.map((category) => (
                    <Checkbox key={category.id} value={category.slug} colorScheme="yellow">
                      <Text color="white">{category.name}</Text>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>

          <Divider borderColor="gold.500" opacity={0.3} />

          {/* Price Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="300" color="white">Price Range</Text>
              </Box>
              <AccordionIcon color="gold.500" />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge colorScheme="yellow">${(filters.priceRange[0] / 100).toFixed(0)}</Badge>
                  <Badge colorScheme="yellow">${(filters.priceRange[1] / 100).toFixed(0)}</Badge>
                </HStack>
                <RangeSlider
                  min={minPrice}
                  max={maxPrice}
                  step={100}
                  value={filters.priceRange}
                  onChange={handlePriceChange}
                  onChangeEnd={handlePriceChangeEnd}
                >
                  <RangeSliderTrack bg="rgba(255, 255, 255, 0.2)">
                    <RangeSliderFilledTrack bg="gold.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} bg="gold.500" />
                  <RangeSliderThumb index={1} bg="gold.500" />
                </RangeSlider>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <Divider borderColor="gold.500" opacity={0.3} />

          {/* Carat Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="300" color="white">Carat Weight</Text>
              </Box>
              <AccordionIcon color="gold.500" />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge colorScheme="yellow">{filters.caratRange[0]} ct</Badge>
                  <Badge colorScheme="yellow">{filters.caratRange[1]} ct</Badge>
                </HStack>
                <RangeSlider
                  min={0}
                  max={10}
                  step={0.25}
                  value={filters.caratRange}
                  onChange={handleCaratChange}
                  onChangeEnd={handleCaratChangeEnd}
                >
                  <RangeSliderTrack bg="rgba(255, 255, 255, 0.2)">
                    <RangeSliderFilledTrack bg="gold.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} bg="gold.500" />
                  <RangeSliderThumb index={1} bg="gold.500" />
                </RangeSlider>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <Divider borderColor="gold.500" opacity={0.3} />

          {/* Stock Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="300" color="white">Availability</Text>
              </Box>
              <AccordionIcon color="gold.500" />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <Checkbox isChecked={filters.inStock} onChange={handleStockChange} colorScheme="yellow">
                <Text color="white">In Stock Only</Text>
              </Checkbox>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
}