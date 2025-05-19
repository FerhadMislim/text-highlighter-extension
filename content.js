(function() {
    // Check if script is already injected
    if (window.textHighlighter) return;
  
    // Create highlighter object to store state
    window.textHighlighter = {
      currentHighlightIndex: -1,
      highlights: [],
      
      highlightText(searchText) {
        this.removeHighlights();
        
        if (!searchText) return;
        
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );
  
        const regex = new RegExp(searchText, 'gi');
        const nodes = [];
        let node;
        
        while (node = walker.nextNode()) {
          if (node.nodeValue.match(regex)) {
            nodes.push(node);
          }
        }
  
        nodes.forEach(node => {
          const matches = [...node.nodeValue.matchAll(regex)];
          let lastIndex = 0;
          const fragment = document.createDocumentFragment();
          
          matches.forEach(match => {
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(
                node.nodeValue.substring(lastIndex, match.index)
              ));
            }
            
            const span = document.createElement('span');
            span.className = 'extension-highlight';
            span.style.backgroundColor = "green";//'#ffeb3b';
            span.textContent = match[0];
            fragment.appendChild(span);
            this.highlights.push(span);
            
            lastIndex = match.index + match[0].length;
          });
          
          if (lastIndex < node.nodeValue.length) {
            fragment.appendChild(document.createTextNode(
              node.nodeValue.substring(lastIndex)
            ));
          }
          
          node.parentNode.replaceChild(fragment, node);
        });
  
        this.currentHighlightIndex = this.highlights.length > 0 ? 0 : -1;
        this.updateCurrentHighlight();
      },
  
      removeHighlights() {
        const highlights = document.querySelectorAll('.extension-highlight');
        highlights.forEach(highlight => {
          const text = highlight.textContent;
          const textNode = document.createTextNode(text);
          highlight.parentNode.replaceChild(textNode, highlight);
        });
        
        this.currentHighlightIndex = -1;
        this.highlights = [];
      },
  
      navigateHighlight(direction) {
        
        if (this.highlights.length === 0) return;
        
        if (direction === 'next') {
          this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.highlights.length;
        } else {
          this.currentHighlightIndex = (this.currentHighlightIndex - 1 + this.highlights.length) % this.highlights.length;
        }
        
        this.updateCurrentHighlight();
      },
  
      updateCurrentHighlight() {
        this.highlights.forEach((highlight, index) => {
          highlight.style.backgroundColor = index === this.currentHighlightIndex ? '#ff9800' : '#ffeb3b';
        });
        
        if (this.currentHighlightIndex >= 0) {
          this.highlights[this.currentHighlightIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    };
  
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'highlight') {
        window.textHighlighter.highlightText(request.data.searchText);
      } else if (request.action === 'navigate') {
        window.textHighlighter.navigateHighlight(request.data.direction);
      }
    });
  })();