// Add global variables for backward compatibility
let preloadFlag = false;

// Image swapping function from the original site - with better error handling
function changeImages() {
  try {
    if (document.images) {
      for (var i=0; i<changeImages.arguments.length; i+=2) {
        // Try to get the element by name
        let imgElement = document[changeImages.arguments[i]];
        if (!imgElement) {
          // Fallback to querySelector
          imgElement = document.querySelector(`img[name="${changeImages.arguments[i]}"]`);
        }
        
        if (imgElement) {
          imgElement.src = changeImages.arguments[i+1];
        }
      }
    }
  } catch (error) {
    console.error("Error in changeImages:", error);
  }
}

// Enhanced version of changeImages that works in modern browsers
function changeImagesEnhanced() {
  try {
    if (document.images) {
      for (var i=0; i<arguments.length; i+=2) {
        const imgName = arguments[i];
        const imgSrc = arguments[i+1];
        
        // Try both document[name] and querySelector approaches for compatibility
        let imgElement = document[imgName];
        if (!imgElement) {
          imgElement = document.querySelector(`img[name="${imgName}"]`);
        }
        
        if (imgElement) {
          imgElement.src = imgSrc;
        }
      }
    }
  } catch (error) {
    console.error("Error in changeImagesEnhanced:", error);
  }
}

// Override the original function with our enhanced version
window.changeImages = changeImagesEnhanced;

// Modern JavaScript for Digital Art House website

// Image preloading with modern JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Set preloadFlag to true after DOM is loaded
  preloadFlag = true;
  
  // Object to store preloaded images
  const preloadedImages = {};
  
  // Function to preload an image
  function preloadImage(imgPath) {
    const img = new Image();
    img.src = imgPath;
    return img;
  }
  
  // Preload all rollover images
  const imagesToPreload = [
    'images/resume-over.gif',
    'images/contact-over.gif',
    'images/web-over.gif',
    'images/print-over.gif',
    'images/photo-over.gif',
    'images/media-over.gif',
    'images/art-over.gif',
    'images/base_logo-over.gif'
  ];
  
  // Preload each image
  imagesToPreload.forEach(imgPath => {
    const imgName = imgPath.split('/').pop().split('.')[0];
    preloadedImages[imgName] = preloadImage(imgPath);
  });
  
  // Add web page specific preloading
  if (document.querySelector('.web-sidebar')) {
    const webPageImagesToPreload = [
      'images/web_20-corpshea_bttn_over.gif',
      'images/web_20-network_bttn_over.gif',
      'images/web_20-photos_bttn_over.gif',
      'images/web_20-griff_bttn_over.gif',
      'images/web_20-ispc_bttn_over.gif',
      'images/web_20-win2000_bttn_over.gif',
      'images/web_20-shea_bttn_over.gif',
      'images/web_20-med_bttn_over.gif',
      'images/web_20-safety_bttn_over.gif',
      'images/web_20-environ_bttn_over.gif',
      'images/govern_bttn-corpshea_bttn_o.gif',
      'images/corpshea_bttn-over.gif',
      'images/network_bttn-over.gif',
      'images/photos_bttn-over.gif',
      'images/griff_bttn-over.gif',
      'images/ispc_bttn-over.gif',
      'images/win2000_bttn-over.gif',
      'images/shea_bttn-over.gif',
      'images/med_bttn-over.gif',
      'images/safety_bttn-over.gif',
      'images/environ_bttn-over.gif'
    ];
    
    webPageImagesToPreload.forEach(imgPath => {
      preloadImage(imgPath);
    });
  }
  
  // Add print page specific preloading
  if (document.querySelector('.print-sidebar')) {
    const printPageImagesToPreload = [
      'images/print_20-2ps_bttn_over.gif',
      'images/print_20-aglowcvr_bttn_over.gif',
      'images/print_20-aglowmag_bttn_over.gif',
      'images/print_20-bookart_bttn_over.gif',
      'images/print_20-npillust_bttn_over.gif',
      'images/print_20-waypoint_bttn_over.gif',
      'images/print_20-ckpoints_bttn_over.gif',
      'images/print_20-breakthru_bttn_ove.gif',
      'images/print_20-ecitcd_bttn_over.gif',
      'images/print_20-stogacd_bttn_over.gif',
      'images/print_20-stratcd_bttn_over.gif',
      'images/print_20-bacd_bttn_over.gif',
      'images/print_20-737cd_bttn_over.gif',
      'images/print_20-staffcd_bttn_over.gif',
      'images/print_20-dixmascd_bttn_over.gif',
      'images/print_20-dijazzcd_bttn_over.gif',
      'images/print_20-di911cd_bttn_over.gif',
      'images/print_20-bn_bttn_over.gif',
      'images/sps_bttn-waypoint_bttn_over.gif'
    ];
    
    printPageImagesToPreload.forEach(imgPath => {
      preloadImage(imgPath);
    });
  }
  
  // Add event listeners to navigation buttons
  document.querySelectorAll('.nav-button').forEach(button => {
    const imgElement = button.querySelector('img');
    if (!imgElement) return; // Skip if no image
    
    const imgName = imgElement.getAttribute('name');
    const normalSrc = imgElement.src;
      // Special handling for buttons with letter suffixes like resume_g, contact_f
    let hoverSrc;
    if (imgName && (imgName.includes('_a') || imgName.includes('_b') || imgName.includes('_c') || imgName.includes('_d') || imgName.includes('_e') || imgName.includes('_f') || imgName.includes('_g'))) {
      // Extract the base name without the letter suffix
      const baseName = imgName.split('_')[0];
      hoverSrc = normalSrc.replace(/\/([^\/]+)\.gif$/, `/${baseName}-over.gif`);
    } else {
      hoverSrc = normalSrc.replace('.gif', '-over.gif');
    }
    
    // Store original sources for reference
    imgElement.dataset.normalSrc = normalSrc;
    imgElement.dataset.hoverSrc = hoverSrc;
    
    button.addEventListener('mouseenter', function() {
      imgElement.src = hoverSrc;
    });
      button.addEventListener('mouseleave', function() {
      // Make sure we restore the original image
      imgElement.src = imgElement.dataset.normalSrc;
    });
    
    // For backward compatibility and special behaviors
    button.addEventListener('mousedown', function(e) {
      // Some buttons had special mousedown behavior
      if (imgName === 'web') {
        imgElement.src = normalSrc;
      }
    });
    
    button.addEventListener('mouseup', function(e) {
      // Some buttons had special mouseup behavior
      if (imgName === 'web') {
        imgElement.src = hoverSrc;
      }
    });
    
    // Touch device support
    button.addEventListener('touchstart', function(e) {
      imgElement.src = hoverSrc;
    });
      button.addEventListener('touchend', function(e) {
      imgElement.src = imgElement.dataset.normalSrc;
    });
  });
  
  // Add keyboard navigation support for accessibility
  document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const imgElement = button.querySelector('img');
        if (imgElement) {
          imgElement.src = imgElement.dataset.hoverSrc;
        }
        setTimeout(() => {
          button.click();
        }, 100);
      }
    });
  });
  
  // Check for visible viewport
  function handleResize() {
    document.body.classList.toggle('mobile-view', window.innerWidth < 800);
  }
  
  // Initial check and event listener for resize
  handleResize();
  window.addEventListener('resize', handleResize);
    // Add event listeners to sidebar buttons for resume page
  const sidebarButtons = document.querySelectorAll('.sidebar-button');
  if (sidebarButtons.length === 0) return; // Not on resume page
  
  // Helper functions to update content for each section
  function updateEducationContent() {
    const resumeContent = document.querySelector('img[name="resume_content"]');
    const skillsButton = document.querySelector('img[name="skills_bttn"]');
    const educateButton = document.querySelector('img[name="educate_bttn"]');
    
    if (resumeContent) resumeContent.src = 'images/resume_content-educate_bttn.gif';
    if (skillsButton) skillsButton.src = 'images/skills_bttn-educate_bttn_ov.gif';
    if (educateButton) educateButton.src = 'images/educate_bttn-over.gif';
  }
  
  function updateHistoryContent() {
    const resumeContent = document.querySelector('img[name="resume_content"]');
    const skillsButton = document.querySelector('img[name="skills_bttn"]');
    const historyButton = document.querySelector('img[name="history_bttn"]');
    
    if (resumeContent) resumeContent.src = 'images/resume_content-history_bttn.gif';
    if (skillsButton) skillsButton.src = 'images/skills_bttn-educate_bttn_ov.gif';
    if (historyButton) historyButton.src = 'images/history_bttn-over.gif';
  }
  
  function updateContinueContent() {
    const resumeContent = document.querySelector('img[name="resume_content"]');
    const skillsButton = document.querySelector('img[name="skills_bttn"]');
    const continueButton = document.querySelector('img[name="continue_bttn"]');
    
    if (resumeContent) resumeContent.src = 'images/resume_content-continue_btt.gif';
    if (skillsButton) skillsButton.src = 'images/skills_bttn-educate_bttn_ov.gif';
    if (continueButton) continueButton.src = 'images/continue_bttn-over.gif';
  }
  
  function resetContent() {
    const resumeContent = document.querySelector('img[name="resume_content"]');
    const skillsButton = document.querySelector('img[name="skills_bttn"]');
    const educateButton = document.querySelector('img[name="educate_bttn"]');
    const historyButton = document.querySelector('img[name="history_bttn"]');
    const continueButton = document.querySelector('img[name="continue_bttn"]');
    
    if (resumeContent) resumeContent.src = 'images/resume_content.gif';
    if (skillsButton) skillsButton.src = 'images/skills_bttn.gif';
    if (educateButton) educateButton.src = 'images/educate_bttn.gif';
    if (historyButton) historyButton.src = 'images/history_bttn.gif';
    if (continueButton) continueButton.src = 'images/continue_bttn.gif';
  }
  
  // Setup for education button
  const educateButton = document.querySelector('a[href="#"] img[name="educate_bttn"]');
  if (educateButton) {
    const buttonParent = educateButton.closest('.sidebar-button');
    if (buttonParent) {
      buttonParent.addEventListener('mouseenter', function() {
        updateEducationContent();
      });
      
      buttonParent.addEventListener('mouseleave', function() {
        resetContent();
      });
      
      // Add click handler
      buttonParent.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        updateEducationContent();
        
        // Reset on next mouseover of any sidebar button
        const allButtons = document.querySelectorAll('.sidebar-button');
        allButtons.forEach(btn => {
          btn.addEventListener('mouseenter', resetAllClickHandlers, { once: true });
        });
      });
    }
  }
  
  // Setup for history button
  const historyButton = document.querySelector('a[href="#"] img[name="history_bttn"]');
  if (historyButton) {
    const buttonParent = historyButton.closest('.sidebar-button');
    if (buttonParent) {
      buttonParent.addEventListener('mouseenter', function() {
        updateHistoryContent();
      });
      
      buttonParent.addEventListener('mouseleave', function() {
        resetContent();
      });
      
      // Add click handler
      buttonParent.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        updateHistoryContent();
        
        // Reset on next mouseover of any sidebar button
        const allButtons = document.querySelectorAll('.sidebar-button');
        allButtons.forEach(btn => {
          btn.addEventListener('mouseenter', resetAllClickHandlers, { once: true });
        });
      });
    }
  }
  
  // Setup for continue button
  const continueButton = document.querySelector('a[href="#"] img[name="continue_bttn"]');
  if (continueButton) {
    const buttonParent = continueButton.closest('.sidebar-button');
    if (buttonParent) {
      buttonParent.addEventListener('mouseenter', function() {
        updateContinueContent();
      });
      
      buttonParent.addEventListener('mouseleave', function() {
        resetContent();
      });
      
      // Add click handler
      buttonParent.addEventListener('click', function(e) {
        e.preventDefault(); // Prevent default anchor behavior
        updateContinueContent();
        
        // Reset on next mouseover of any sidebar button
        const allButtons = document.querySelectorAll('.sidebar-button');
        allButtons.forEach(btn => {
          btn.addEventListener('mouseenter', resetAllClickHandlers, { once: true });
        });
      });
    }
  }
  
  // Helper function to reset all click handlers
  function resetAllClickHandlers() {
    resetContent();
    const allButtons = document.querySelectorAll('.sidebar-button');
    allButtons.forEach(btn => {
      btn.removeEventListener('mouseenter', resetAllClickHandlers);
    });
  }    // Add touch support for mobile devices for resume sidebar buttons
  document.querySelectorAll('.sidebar-button').forEach(btn => {
    // Store which button function to call
    let updateFunction;
    const imgName = btn.querySelector('img')?.getAttribute('name');
    if (imgName === 'educate_bttn') {
      updateFunction = updateEducationContent;
    } else if (imgName === 'history_bttn') {
      updateFunction = updateHistoryContent;
    } else if (imgName === 'continue_bttn') {
      updateFunction = updateContinueContent;
    }
    
    // Add touchstart event
    btn.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Prevent scrolling
      
      // Apply the hover effect on touch
      if (updateFunction) {
        updateFunction();
        
        // Highlight this button visually
        btn.classList.add('active');
        
        // Reset all buttons when touching anywhere else
        const resetTouch = function(evt) {
          if (!btn.contains(evt.target)) {
            resetContent();
            btn.classList.remove('active');
            document.removeEventListener('touchstart', resetTouch);
          }
        };
        
        // Add listener to detect touches elsewhere
        document.addEventListener('touchstart', resetTouch);
      }
    });
  });
  
  // Web page specific functionality
  const webSidebarButtons = document.querySelectorAll('.web-sidebar-button');
  if (webSidebarButtons.length > 0) {
    webSidebarButtons.forEach(btn => {
      // Add touch support for mobile devices
      btn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        // Trigger the same behavior as mouseover
        const mouseoverEvent = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        btn.dispatchEvent(mouseoverEvent);
      });
      
      btn.addEventListener('touchend', function(e) {
        e.preventDefault();
        // Trigger the same behavior as mouseout after a delay
        setTimeout(() => {
          const mouseoutEvent = new MouseEvent('mouseout', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          btn.dispatchEvent(mouseoutEvent);
        }, 300);
      });
    });
  }
  
  // Add click functionality to web page buttons
  document.querySelectorAll('.web-sidebar-button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default anchor behavior
      
      // Extract image names from onmouseover attribute
      const onmouseoverAttr = button.getAttribute('onmouseover');
      if (!onmouseoverAttr) return;
      
      // Extract the second parameter (e.g., 'images/web_20-environ_bttn_over.gif')
      const regex = /changeImages\(\s*'([^']+)',\s*'([^']+)',/;
      const matches = onmouseoverAttr.match(regex);
      
      if (matches && matches.length >= 3) {
        const targetImgName = matches[1]; // 'web_20'
        const targetImgSrc = matches[2]; // 'images/web_20-environ_bttn_over.gif'
        
        // Keep the hovered image displayed even after clicking
        const targetImg = document.querySelector(`img[name="${targetImgName}"]`);
        if (targetImg) {
          targetImg.src = targetImgSrc;
          
          // Reset on next mouseover of any other web sidebar button
          const allWebButtons = document.querySelectorAll('.web-sidebar-button');
          allWebButtons.forEach(btn => {
            if (btn !== button) {
              btn.addEventListener('mouseenter', function resetWebImage() {
                // Reset to default image
                targetImg.src = `images/${targetImgName}.gif`;
                // Remove this one-time event listener
                allWebButtons.forEach(b => b.removeEventListener('mouseenter', resetWebImage));
              }, { once: true });
            }
          });
        }
      }
    });
  });
    // Add improved touch support for mobile devices
  document.querySelectorAll('.web-sidebar-button').forEach(button => {
    button.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Prevent default behavior
      
      // Parse the onmouseover attribute for the image paths
      const onmouseoverAttr = button.getAttribute('onmouseover');
      if (!onmouseoverAttr) return;
      
      // Extract function call parameters
      const funcCallMatch = onmouseoverAttr.match(/changeImages\(([^)]+)\)/);
      if (!funcCallMatch) return;
      
      // Get params string and split by comma
      const paramsStr = funcCallMatch[1];
      // Split by comma but respect quotes
      const params = [];
      let currentParam = '';
      let inQuote = false;
      
      for (let i = 0; i < paramsStr.length; i++) {
        const char = paramsStr[i];
        
        if (char === "'" && (i === 0 || paramsStr[i-1] !== '\\')) {
          inQuote = !inQuote;
          currentParam += char;
        } else if (char === ',' && !inQuote) {
          params.push(currentParam.trim());
          currentParam = '';
        } else {
          currentParam += char;
        }
      }
      
      if (currentParam) {
        params.push(currentParam.trim());
      }
      
      // Now call our enhanced changeImages function with the extracted parameters
      if (params.length >= 6) {
        // Remove quotes from params
        const cleanParams = params.map(p => p.replace(/^'|'$/g, ''));
        // Call the changeImages function with direct arguments
        changeImagesEnhanced(
          cleanParams[0], cleanParams[1], 
          cleanParams[2], cleanParams[3], 
          cleanParams[4], cleanParams[5]
        );
        
        // Highlight this button visually
        button.classList.add('active');
        
        // Reset all buttons when touching anywhere else
        const resetTouch = function(evt) {
          if (!button.contains(evt.target)) {
            // Get the onmouseout parameters
            const onmouseoutAttr = button.getAttribute('onmouseout');
            if (onmouseoutAttr) {
              const outFuncCall = onmouseoutAttr.match(/changeImages\(([^)]+)\)/);
              if (outFuncCall) {
                // Get reset params
                const resetParamsStr = outFuncCall[1];
                const resetParams = [];
                let resetCurrentParam = '';
                let resetInQuote = false;
                
                for (let i = 0; i < resetParamsStr.length; i++) {
                  const char = resetParamsStr[i];
                  if (char === "'" && (i === 0 || resetParamsStr[i-1] !== '\\')) {
                    resetInQuote = !resetInQuote;
                    resetCurrentParam += char;
                  } else if (char === ',' && !resetInQuote) {
                    resetParams.push(resetCurrentParam.trim());
                    resetCurrentParam = '';
                  } else {
                    resetCurrentParam += char;
                  }
                }
                
                if (resetCurrentParam) {
                  resetParams.push(resetCurrentParam.trim());
                }
                
                if (resetParams.length >= 6) {
                  const cleanResetParams = resetParams.map(p => p.replace(/^'|'$/g, ''));
                  changeImagesEnhanced(
                    cleanResetParams[0], cleanResetParams[1], 
                    cleanResetParams[2], cleanResetParams[3], 
                    cleanResetParams[4], cleanResetParams[5]
                  );
                }
              }
            }
            
            // Remove visual highlight
            button.classList.remove('active');
            
            // Remove this event listener
            document.removeEventListener('touchstart', resetTouch);
          }
        };
        
        // Add listener to detect touches elsewhere
        document.addEventListener('touchstart', resetTouch);
      }
    });
  });
});

// Add direct event handlers for web sidebar buttons
document.addEventListener('DOMContentLoaded', function() {
  const webSidebarButtons = document.querySelectorAll('.web-sidebar-button');
  const web20Image = document.querySelector('img[name="web_20"]');
  
  if (webSidebarButtons.length > 0 && web20Image) {
    // Default image source
    const defaultSrc = web20Image.src;
    
    webSidebarButtons.forEach(button => {
      // Extract image URLs from onmouseover attribute
      const onmouseoverAttr = button.getAttribute('onmouseover');
      if (!onmouseoverAttr) return;
      
      // Extract target image URL
      const regex = /changeImages\(\s*'([^']+)',\s*'([^']+)',/;
      const matches = onmouseoverAttr.match(regex);
      
      if (matches && matches.length >= 3) {
        const targetImgSrc = matches[2]; // 'images/web_20-environ_bttn_over.gif'
        
        // Add mouseenter event listener
        button.addEventListener('mouseenter', function() {
          web20Image.src = targetImgSrc;
        });
        
        // Add mouseleave event listener
        button.addEventListener('mouseleave', function() {
          web20Image.src = defaultSrc;
        });
      }
    });
  }
});

// Add direct event handlers for print sidebar buttons
document.addEventListener('DOMContentLoaded', function() {
  const printSidebarButtons = document.querySelectorAll('.print-sidebar-button');
  const print20Image = document.querySelector('img[name="print_20"]');
  
  if (printSidebarButtons.length > 0 && print20Image) {
    // Default image source
    const defaultSrc = print20Image.src;
    
    printSidebarButtons.forEach(button => {
      // Extract image URLs from onmouseover attribute
      const onmouseoverAttr = button.getAttribute('onmouseover');
      if (!onmouseoverAttr) return;
      
      // Extract target image URL
      const regex = /changeImages\(\s*'([^']+)',\s*'([^']+)',/;
      const matches = onmouseoverAttr.match(regex);
      
      if (matches && matches.length >= 3) {
        const targetImgSrc = matches[2]; // 'images/print_20-2ps_bttn_over.gif'
        
        // Add mouseenter event listener
        button.addEventListener('mouseenter', function() {
          print20Image.src = targetImgSrc;
        });
        
        // Add mouseleave event listener
        button.addEventListener('mouseleave', function() {
          print20Image.src = defaultSrc;
        });
        
        // Add click handler to keep the image displayed
        button.addEventListener('click', function(e) {
          e.preventDefault();
          print20Image.src = targetImgSrc;
          
          // Add active class to this button
          button.classList.add('active');
          
          // Remove active class from other buttons
          printSidebarButtons.forEach(btn => {
            if (btn !== button) {
              btn.classList.remove('active');
            }
          });
          
          // Reset on next mouseover of any other print sidebar button
          printSidebarButtons.forEach(btn => {
            if (btn !== button) {
              btn.addEventListener('mouseenter', function resetPrintImage() {
                // Reset active class
                button.classList.remove('active');
                
                // Remove this one-time event listener
                printSidebarButtons.forEach(b => b.removeEventListener('mouseenter', resetPrintImage));
              }, { once: true });
            }
          });
        });
      }
    });
  }
});

// Backward compatibility fix to ensure inline onmouseover/onmouseout works properly
document.addEventListener('DOMContentLoaded', function() {
  // Initialize preloadFlag immediately
  preloadFlag = true;
  
  // Fix for direct document[name] access in browsers that restrict it
  const namedElements = document.querySelectorAll('[name]');
  namedElements.forEach(el => {
    if (el.hasAttribute('name')) {
      const name = el.getAttribute('name');
      if (name) {
        // Create a reference to the element via document
        document[name] = el;
      }
    }
  });
  
  // Load web page images immediately
  const webMainImg = document.querySelector('img[name="web_20"]');
  if (webMainImg) {
    new Image().src = 'images/web_20.gif';
    
    // Preload all variations of the main content image
    const variations = [
      'images/web_20-corpshea_bttn_over.gif',
      'images/web_20-network_bttn_over.gif',
      'images/web_20-photos_bttn_over.gif',
      'images/web_20-griff_bttn_over.gif',
      'images/web_20-ispc_bttn_over.gif',
      'images/web_20-win2000_bttn_over.gif',
      'images/web_20-shea_bttn_over.gif',
      'images/web_20-med_bttn_over.gif',
      'images/web_20-safety_bttn_over.gif',
      'images/web_20-environ_bttn_over.gif'
    ];
    
    variations.forEach(src => {
      new Image().src = src;
    });
  }
});

// Photo page specific functions
function initPhotoPage() {
  // Preload images for photography page
  if (document.querySelector('.photo-sidebar')) {
    const photoPageImagesToPreload = [
      'images/photo_20-falls_bttn_over.gif',
      'images/photo_20-ball_bttn_over.gif',
      'images/photo_20-island_bttn_over.gif',
      'images/photo_20-sunk_bttn_over.gif',
      'images/photo_20-can_bttn_over.gif',
      'images/photo_20-sign1_bttn_over.gif',
      'images/photo_20-sign2_bttn_over.gif',
      'images/photo_20-olmos_bttn_over.gif',
      'images/photo_20-ice_bttn_over.gif',
      'images/photo_20-orleans_bttn_over.gif',
      'images/photo_20-corvette_bttn_over.gif',
      'images/photo_20-dryclean_bttn_over.gif',
      'images/photo_20-shoe_bttn_over.gif',
      'images/photo_20-autoshop_bttn_over.gif',
      'images/photo_20-barber_bttn_over.gif',
      'images/photo_20-eyeye_bttn_over.gif',
      'images/eggs_bttn-falls_bttn_over.gif',
      'images/falls_bttn-over.gif',
      'images/ball_bttn-over.gif',
      'images/island_bttn-over.gif',
      'images/sunk_bttn-over.gif',
      'images/can_bttn-over.gif',
      'images/sign1_bttn-over.gif',
      'images/sign2_bttn-over.gif',
      'images/olmos_bttn-over.gif',
      'images/ice_bttn-over.gif',
      'images/orleans_bttn-over.gif',
      'images/corvette_bttn-over.gif',
      'images/dryclean_bttn-over.gif',
      'images/shoe_bttn-over.gif',
      'images/autoshop_bttn-over.gif',
      'images/barber_bttn-over.gif',
      'images/eyeye_bttn-over.gif',
      'images/photo_c-resume_over.gif'
    ];
    
    photoPageImagesToPreload.forEach(imgPath => {
      preloadImage(imgPath);
    });
    
    // Make sure the main photo element is ready
    const mainPhotoElem = document.querySelector('img[name="photo_20"]');
    
    // Add event listeners for photo sidebar buttons
    document.querySelectorAll('.photo-sidebar-button').forEach(button => {
      const imgElements = button.querySelectorAll('img');
      
      // Enhanced compatibility - handle both modern and legacy events
      const handleMouseover = function(e) {
        if (button.hasAttribute('onmouseover')) {
          // Let the original event handler work
          return;
        }
        
        // Modern event handling fallback
        imgElements.forEach(img => {
          if (img.getAttribute('name')) {
            const hoverSrc = img.src.replace('.gif', '-over.gif');
            img.dataset.normalSrc = img.src;
            img.dataset.hoverSrc = hoverSrc;
            img.src = hoverSrc;
          }
        });
        
        // Change main image if needed
        if (mainPhotoElem) {
          const imgName = button.querySelector('img').getAttribute('name');
          if (imgName) {
            mainPhotoElem.dataset.normalSrc = mainPhotoElem.src;
            mainPhotoElem.dataset.hoverSrc = `images/photo_20-${imgName}_over.gif`;
            mainPhotoElem.src = mainPhotoElem.dataset.hoverSrc;
          }
        }
      };
      
      const handleMouseout = function(e) {
        if (button.hasAttribute('onmouseout')) {
          // Let the original event handler work
          return;
        }
        
        // Modern event handling fallback
        imgElements.forEach(img => {
          if (img.dataset.normalSrc) {
            img.src = img.dataset.normalSrc;
          }
        });
        
        // Restore main image if needed
        if (mainPhotoElem && mainPhotoElem.dataset.normalSrc) {
          mainPhotoElem.src = mainPhotoElem.dataset.normalSrc;
        }
      };
      
      // Add event listeners only if they don't have inline handlers
      if (!button.hasAttribute('onmouseover')) {
        button.addEventListener('mouseover', handleMouseover);
      }
      
      if (!button.hasAttribute('onmouseout')) {
        button.addEventListener('mouseout', handleMouseout);
      }
      
      // Mobile-friendly touch events
      button.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const event = new MouseEvent('mouseover', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        this.dispatchEvent(event);
      });
      
      button.addEventListener('touchend', function(e) {
        e.preventDefault();
        const event = new MouseEvent('mouseout', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        this.dispatchEvent(event);
        
        // If it's an actual link, navigate
        const href = this.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      });
    });
  }
}

// Media page specific functions
function initMediaPage() {
  // Preload images for media page
  if (document.querySelector('.media-sidebar')) {
    const mediaPageImagesToPreload = [
      'images/media_20-strat_bttn_over.gif',
      'images/media_20-ecit_bttn_over.gif',
      'images/media_20-ba_bttn_over.gif',
      'images/media_20-737_bttn_over.gif',
      'images/media_20-staff_bttn_over.gif',
      'images/media_20-evm_bttn_over.gif',
      'images/stoga_bttn-strat_bttn_over.gif',
      'images/strat_bttn-over.gif',
      'images/ecit_bttn-over.gif',
      'images/ba_bttn-over.gif',
      'images/737_bttn-over.gif',
      'images/staff_bttn-over.gif',
      'images/evm_bttn-over.gif'
    ];
    
    mediaPageImagesToPreload.forEach(imgPath => {
      const img = new Image();
      img.src = imgPath;
    });
    
    // Add direct event handlers for media sidebar buttons
    const mediaSidebarButtons = document.querySelectorAll('.media-sidebar-button');
    const media20Image = document.querySelector('img[name="media_20"]');
    
    if (mediaSidebarButtons.length > 0 && media20Image) {
      mediaSidebarButtons.forEach(button => {
        // Add modern event listeners to supplement the inline ones
        button.addEventListener('mouseenter', function() {
          // The mouseenter effect is handled by the inline onmouseover attributes
        });
        
        button.addEventListener('mouseleave', function() {
          // The mouseleave effect is handled by the inline onmouseout attributes
        });
        
        // Add focus/blur events for keyboard navigation
        button.addEventListener('focus', function() {
          this.classList.add('focused');
        });
        
        button.addEventListener('blur', function() {
          this.classList.remove('focused');
        });
        
        // Add touch support for mobile devices
        button.addEventListener('touchstart', function(e) {
          e.preventDefault();
          // Trigger the same effect as mouseover
          const mouseoverEvent = new Event('mouseover', { bubbles: true });
          this.dispatchEvent(mouseoverEvent);
        });
        
        button.addEventListener('touchend', function() {
          // Handle touch end if needed
        });
      });
    }
  }
}

// Add initPhotoPage to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
  // Initialize page-specific functions
  initPhotoPage();
  initMediaPage();
});
