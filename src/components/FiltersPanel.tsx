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
  maxPrice = 100000,
  minPrice = 0,
}: FiltersPanelProps) {
  const [filters, setFilters] = React.useState<FilterState>({
    categories: [],
    priceRange: [minPrice / 100, maxPrice / 100],
    caratRange: [0, 10],
    inStock: false,
  })

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories)
    const newFilters = { ...filters, categories }
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
      priceRange: [minPrice / 100, maxPrice / 100],
      caratRange: [0, 10],
      inStock: false,
    }
    setFilters(newFilters)
    setSelectedCategories([])
    onFiltersChange?.(newFilters)
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] !== minPrice / 100 ||
    filters.priceRange[1] !== maxPrice / 100 ||
    filters.caratRange[0] !== 0 ||
    filters.caratRange[1] !== 10 ||
    filters.inStock

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Filters</Heading>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Clear all
            </Button>
          )}
        </HStack>

        <Accordion allowMultiple defaultIndex={[0, 1, 2]}>
          {/* Categories Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Categories</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <CheckboxGroup value={selectedCategories} onChange={handleCategoryChange}>
                <Stack spacing={2}>
                  {categories.map((category) => (
                    <Checkbox key={category.id} value={category.slug}>
                      {category.name}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </AccordionPanel>
          </AccordionItem>

          <Divider />

          {/* Price Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Price Range</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge>${filters.priceRange[0]}</Badge>
                  <Badge>${filters.priceRange[1]}</Badge>
                </HStack>
                <RangeSlider
                  min={minPrice / 100}
                  max={maxPrice / 100}
                  step={100}
                  value={filters.priceRange}
                  onChange={handlePriceChange}
                  onChangeEnd={handlePriceChangeEnd}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack bg="brand.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <Divider />

          {/* Carat Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Carat Weight</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Badge>{filters.caratRange[0]} ct</Badge>
                  <Badge>{filters.caratRange[1]} ct</Badge>
                </HStack>
                <RangeSlider
                  min={0}
                  max={10}
                  step={0.25}
                  value={filters.caratRange}
                  onChange={handleCaratChange}
                  onChangeEnd={handleCaratChangeEnd}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack bg="brand.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <Divider />

          {/* Stock Filter */}
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Availability</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel px={0} pb={4}>
              <Checkbox isChecked={filters.inStock} onChange={handleStockChange}>
                In Stock Only
              </Checkbox>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  )
}