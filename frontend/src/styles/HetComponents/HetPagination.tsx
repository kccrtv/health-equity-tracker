import { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import HetPaginationButton from './HetPaginationButton'
import type { RouteConfig } from '../../pages/Methodology/methodologyContent/routeConfigs'

interface HetPaginationProps {
  routeConfigs: RouteConfig[]
  className?: string
}

export default function HetPagination({ routeConfigs, className }: HetPaginationProps) {
  const history = useHistory()
  const location = useLocation()
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  const currentIndex = routeConfigs.findIndex(
    (route) => route.path === location.pathname
  )

  const nextRoute = routeConfigs[currentIndex + 1]
  const prevRoute = routeConfigs[currentIndex - 1]

  function goNext() {
    if (nextRoute) {
      history.push(nextRoute.path)
    }
  }

  function goPrevious() {
    if (prevRoute) {
      history.push(prevRoute.path)
    }
  }

<<<<<<< HEAD
=======
  const nextButtonClassName =
    !prevRoute && isLargeScreen ? 'ml-auto' : ''

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 960)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

>>>>>>> ad9403cb (Policy hub content enhancements and route config updates (#3625))
  return (
    <div className={`mx-0 smMd:mb-0 mb-8 mt-8 flex w-full flex-col justify-between md:mt-16 md:flex-row gap-4 md:self-stretch ${className ?? ''}`}>
      {prevRoute ? (
        <HetPaginationButton direction='previous' onClick={goPrevious}>
          {prevRoute.label}
        </HetPaginationButton>
      ) : (
        null
      )}

      {nextRoute ? (
        <HetPaginationButton
          direction='next'
          onClick={goNext}
          disabled={currentIndex === routeConfigs.length - 1}
        >
          {nextRoute.label}
        </HetPaginationButton>
      ) : (
        <div></div>
      )}
    </div>
  )
}