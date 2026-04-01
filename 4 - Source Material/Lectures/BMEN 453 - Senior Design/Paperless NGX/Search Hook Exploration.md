---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[Lectures]]"
Topic:
  - "[[BMEN 453 - Senior Design]]"
Status: Unweathered
Published: false
---
---
## global-search.component.ts

\src-ui\src\app\components\app-frame\global-search\global-search.component.ts

Imports hella different search functionality

Need to add our search version to the GlobalSearchType variable
```typescript
import { GlobalSearchType, SETTINGS_KEYS } from 'src/app/data/ui-settings'
```

Need to add our search version name and hook to global-search.component.html
```typescript
@Component({

  selector: 'pngx-global-search',

  templateUrl: './global-search.component.html',

  styleUrl: './global-search.component.scss',

})
```


Need to actually build our search within the search.service

```typescript
import {
  GlobalSearchResult,
  SearchService,
} from 'src/app/services/rest/search.service'
```

Will likely have to adjust some settings in the document list and document services (just to display sorted by relevance)

```typescript
import { DocumentListViewService } from 'src/app/services/document-list-view.service'
import { DocumentService } from 'src/app/services/rest/document.service'
```

Potentially notable snippet:

```typescript
public runFullSearch() {
    const ruleType = this.useAdvancedForFullSearch
      ? FILTER_FULLTEXT_QUERY
      : FILTER_TITLE_CONTENT
    this.documentListViewService.quickFilter([
      { rule_type: ruleType, value: this.query },
    ])
    this.reset(true)
  }
```

^ the above could be modified for a behind the scenes search by the AI