# Product Marketing Image Generation Feature

## Objective
Implement a feature in the SaaS that allows the user to upload a product photo, choose one of two visual styles, and generate a new marketing-ready image using the OpenAI image editing API.

The feature must:
- Accept a single product photo uploaded by the user.
- Let the user choose one of two styles:
  - **CHAMATIVO** (bold, vibrant, high-conversion advertising look)
  - **CONSERVADOR** (clean, elegant, neutral-background commercial look)
- Generate a new image while preserving the original product identity.
- Allow the user to either:
  - **Like** the result and save it to the gallery.
  - **Dislike** the result and request another variation.
- Store generation history and feedback for future improvements.

---

## Recommended API Strategy
Since the OpenAI API is already configured in the project, use the **Images Edit API** with a GPT Image model to transform the uploaded photo into a new marketing image.

Recommended model priority:
1. `gpt-image-1.5` for best quality and prompt adherence.
2. `gpt-image-1` if you want to keep compatibility with the current setup.
3. `gpt-image-1-mini` only if cost reduction is more important than output quality.

Use this endpoint for image editing:
- `POST /v1/images/edits`

---

## Functional Requirements

### User Flow
1. User opens the image generation screen.
2. User uploads one product photo.
3. User selects one style:
   - **CHAMATIVO**
   - **CONSERVADOR**
4. User clicks **Generate**.
5. System sends the uploaded image and the style prompt to OpenAI.
6. System receives the generated image.
7. System displays the generated image preview.
8. User can:
   - Click **Like** → save image in gallery.
   - Click **Dislike** → discard the current result and generate a new variation using the same original image and style.
9. All generations should be linked to the original uploaded image and the chosen style.

### Business Rules
- The generated image must preserve the original product identity.
- Do not alter the product model, structure, proportions, packaging, label, ingredients, quantity, or physical format.
- Do not add text, logos, fake seals, watermarks, pricing tags, or banners.
- Keep the result commercially attractive and realistic.
- If the product photo quality is low, the system should still attempt to improve presentation without changing the product itself.
- If regeneration is requested, always reuse the original uploaded image, not the previously generated output.

---

## Style Definitions

### 1. CHAMATIVO
A bold, vivid, persuasive, high-conversion advertising style.

Visual goals:
- Strong commercial appeal.
- Vibrant colors.
- Creative and eye-catching composition.
- Premium advertising look similar to retail campaigns or TV product commercials.
- Background and lighting must match the product category.
- No text in the image.

### 2. CONSERVADOR
A more neutral, elegant, safe commercial presentation.

Visual goals:
- Clean and professional studio look.
- Neutral or soft background.
- Controlled lighting.
- Minimalist composition.
- Realistic product presentation.
- No text in the image.

---

## Master Prompt Strategy
The implementation should use a **base prompt** plus a **style-specific prompt**.

This keeps the generation consistent and easier to maintain.

### Base Prompt
Use this prompt in every generation:

```text
You are an expert commercial product photographer and high-conversion advertising creative director.
Create a new professional marketing image based on the uploaded product photo.
Preserve the product exactly as it is in the original image, including its model, shape, proportions, packaging, label structure, materials, colors, ingredients, quantity, and all defining visual characteristics.
Do not invent, remove, or replace product elements.
Do not add any text, letters, logos, price tags, stickers, badges, watermarks, or promotional banners.
Improve only the presentation, lighting, composition, realism, and commercial attractiveness.
The result must look like a real, premium, professionally photographed product advertisement.
The product must remain the clear focal point.
```

### CHAMATIVO Prompt
```text
You are an expert commercial product photographer and high-conversion advertising creative director.
Create a new professional marketing image based on the uploaded product photo.
Preserve the product exactly as it is in the original image, including its model, shape, proportions, packaging, label structure, materials, colors, ingredients, quantity, and all defining visual characteristics.
Do not invent, remove, or replace product elements.
Do not add any text, letters, logos, price tags, stickers, badges, watermarks, or promotional banners.
Improve only the presentation, lighting, composition, realism, and commercial attractiveness.
The result must look like a real, premium, professionally photographed product advertisement.
The product must remain the clear focal point.

Style direction:
Create a bold, vibrant, eye-catching advertising image designed for high sales conversion.
Make the image visually striking, polished, and creative, similar to a premium retail campaign or television commercial product shot.
Use vivid colors, dynamic but clean composition, attractive lighting, depth, contrast, and a background that matches the product category.
The image must feel highly appealing and marketable, but still realistic and professional.
No text.
```

### CONSERVADOR Prompt
```text
You are an expert commercial product photographer and high-conversion advertising creative director.
Create a new professional marketing image based on the uploaded product photo.
Preserve the product exactly as it is in the original image, including its model, shape, proportions, packaging, label structure, materials, colors, ingredients, quantity, and all defining visual characteristics.
Do not invent, remove, or replace product elements.
Do not add any text, letters, logos, price tags, stickers, badges, watermarks, or promotional banners.
Improve only the presentation, lighting, composition, realism, and commercial attractiveness.
The result must look like a real, premium, professionally photographed product advertisement.
The product must remain the clear focal point.

Style direction:
Create a conservative, elegant, clean commercial image with a neutral or soft background.
Use studio-quality lighting, balanced composition, subtle shadows, and a refined professional look.
Keep the image realistic, safe, minimal, and suitable for catalogs, marketplaces, and corporate product presentation.
No text.
```

---

## Regeneration Prompt Strategy
When the user clicks **Dislike** and chooses to regenerate, continue using the original uploaded image and the same chosen style, but vary the composition slightly.

### Regeneration Complement
Append the following instruction on retries:

```text
Generate a new variation using the same product and the same style direction, but change the scene composition, camera framing, lighting arrangement, and background details while preserving the exact product identity.
```

Optional retry counter behavior:
- Retry 1: slightly different framing.
- Retry 2: different lighting mood.
- Retry 3: different background composition.
- Retry 4+: random controlled variation, always preserving the original product.

---

## Suggested Backend Design

### Endpoint Proposal
#### 1. Upload original image
`POST /api/product-images/upload`

Request:
- multipart/form-data
- file: image

Response:
- originalImageId
- originalImageUrl

#### 2. Generate marketing image
`POST /api/product-images/generate`

Request body:
```json
{
  "originalImageId": "guid",
  "style": "CHAMATIVO",
  "retryOfGenerationId": null
}
```

Response body:
```json
{
  "generationId": "guid",
  "status": "completed",
  "style": "CHAMATIVO",
  "imageUrl": "https://...",
  "promptUsed": "...",
  "createdAt": "2026-03-13T12:00:00Z"
}
```

#### 3. Register like
`POST /api/product-images/{generationId}/like`

Behavior:
- mark generation as liked
- save image to gallery
- set gallery visibility = true

#### 4. Register dislike
`POST /api/product-images/{generationId}/dislike`

Behavior:
- mark generation as disliked
- keep record for analytics
- do not show in gallery unless explicitly saved later

#### 5. List gallery
`GET /api/product-images/gallery`

---

## Suggested Database Entities

### ProductImageOriginal
```text
Id
UserId
OriginalFileName
StoragePath
ContentType
Width
Height
CreatedAt
```

### ProductImageGeneration
```text
Id
OriginalImageId
UserId
Style
PromptUsed
OpenAiModel
Status
StoragePath
RetryOfGenerationId
IsLiked
IsDisliked
IsInGallery
CreatedAt
```

### ProductImageFeedback
```text
Id
GenerationId
UserId
FeedbackType   // LIKE or DISLIKE
CreatedAt
```

---

## Suggested Application Service Logic

### Generation Service Responsibilities
- Validate uploaded file.
- Validate allowed styles.
- Load original image from storage.
- Build final prompt.
- Send image edit request to OpenAI.
- Decode and save generated image.
- Persist metadata and feedback state.

### Prompt Builder Responsibilities
Create a dedicated component such as:
- `IProductMarketingPromptBuilder`
- `ProductMarketingPromptBuilder`

Methods:
- `BuildBasePrompt()`
- `BuildPrompt(style)`
- `BuildRetryPrompt(style, retryCount)`

Example logic:
```csharp
public string BuildPrompt(ImageStyle style, bool isRetry = false)
{
    var basePrompt = GetBasePrompt();
    var stylePrompt = style switch
    {
        ImageStyle.CHAMATIVO => GetChamativoPrompt(),
        ImageStyle.CONSERVADOR => GetConservadorPrompt(),
        _ => throw new ArgumentOutOfRangeException(nameof(style))
    };

    var retryPrompt = isRetry
        ? "Generate a new variation using the same product and the same style direction, but change the scene composition, camera framing, lighting arrangement, and background details while preserving the exact product identity."
        : string.Empty;

    return $"{basePrompt}\n\n{stylePrompt}\n\n{retryPrompt}".Trim();
}
```

---

## Suggested OpenAI Integration Flow
Since the API credentials are already configured, the implementation should focus on image edit orchestration.

### Recommended Request Parameters
- `model`: `gpt-image-1.5` or `gpt-image-1`
- `size`: use a square or portrait format depending on your product use case
- `quality`: medium or high
- `output_format`: `png` or `jpeg`
- `n`: `1`

### High-Level Flow
1. Read original image bytes from storage.
2. Create multipart/form-data request.
3. Add model.
4. Add prompt.
5. Add image file.
6. Send request to OpenAI Images Edit API.
7. Receive base64 image.
8. Convert to bytes.
9. Save generated image to storage.
10. Persist generation record in database.

### C# Service Skeleton
```csharp
public async Task<ProductImageGenerationResult> GenerateAsync(ProductImageGenerationRequest request, CancellationToken cancellationToken)
{
    var original = await _repository.GetOriginalImageAsync(request.OriginalImageId, cancellationToken);
    if (original is null)
        throw new BusinessException("Original image not found.");

    var prompt = _promptBuilder.BuildPrompt(request.Style, request.IsRetry);

    using var form = new MultipartFormDataContent();
    form.Add(new StringContent(_settings.Model), "model");
    form.Add(new StringContent(prompt), "prompt");
    form.Add(new StringContent("1"), "n");
    form.Add(new StringContent("high"), "quality");
    form.Add(new StringContent("jpeg"), "output_format");

    var imageBytes = await _fileStorage.ReadAsync(original.StoragePath, cancellationToken);
    var imageContent = new ByteArrayContent(imageBytes);
    imageContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(original.ContentType);

    form.Add(imageContent, "image", original.OriginalFileName);

    using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "v1/images/edits")
    {
        Content = form
    };

    var response = await _httpClient.SendAsync(requestMessage, cancellationToken);
    response.EnsureSuccessStatusCode();

    var json = await response.Content.ReadAsStringAsync(cancellationToken);
    var generatedBytes = _openAiImageParser.ExtractBytes(json);

    var generatedPath = await _fileStorage.SaveGeneratedImageAsync(generatedBytes, cancellationToken);

    var generation = await _repository.SaveGenerationAsync(new SaveGenerationInput
    {
        OriginalImageId = original.Id,
        Style = request.Style,
        PromptUsed = prompt,
        StoragePath = generatedPath,
        Status = "completed",
        IsLiked = false,
        IsDisliked = false,
        IsInGallery = false
    }, cancellationToken);

    return generation;
}
```

---

## Frontend UX Proposal

### Main Screen
Components:
- Upload area
- Style selector with 2 cards
- Generate button
- Preview area
- Like button
- Dislike / Generate Another button
- Gallery section

### Style Card Texts
#### CHAMATIVO
- Bold marketing look
- Vibrant colors
- Higher visual impact
- Good for ads and social media

#### CONSERVADOR
- Neutral background
- Elegant and clean look
- Safer for catalogs and marketplaces
- Better for professional listing photos

### Button Rules
- Disable Generate until an image is uploaded and a style is selected.
- Show loading while generating.
- Show retry action only after a result is returned.
- When user clicks Like:
  - Save to gallery.
  - Show success message.
- When user clicks Dislike:
  - Mark feedback.
  - Offer immediate regenerate action.

---

## Validation Rules
- Accept only image formats: jpg, jpeg, png, webp.
- Enforce max file size, for example 10 MB.
- Reject empty files.
- Reject unsupported MIME types.
- Validate style enum strictly.
- Prevent multiple simultaneous generations for the same user request if needed.

---

## Error Handling
Return friendly errors for:
- invalid file
- unsupported format
- image too large
- OpenAI timeout
- OpenAI moderation refusal
- storage failure
- generation not found
- feedback already registered

Example user-facing messages:
- `The uploaded file is not a supported image format.`
- `We could not generate the image at this time. Please try again.`
- `Your image was uploaded, but saving the generated result failed.`

---

## Logging and Observability
Track at least:
- upload success/failure
- generation request started
- generation request completed
- generation request failed
- average generation time
- like/dislike rate per style
- regeneration count per original image

Useful metrics:
- total generations per day
- conversion rate from generated to liked
- most selected style
- average retries before like

---

## Storage Recommendation
Store separately:
- original uploads
- generated images
- gallery images

Suggested paths:
- `/product-images/originals/{userId}/{fileName}`
- `/product-images/generated/{userId}/{generationId}.jpg`
- `/product-images/gallery/{userId}/{generationId}.jpg`

If the gallery uses the same generated file, keep only a metadata flag such as `IsInGallery = true` instead of copying files.

---

## Security Considerations
- Validate file signature when possible, not only extension.
- Sanitize file names.
- Authenticate all endpoints.
- Authorize access by user ownership.
- Rate limit generation endpoints.
- Avoid exposing raw provider responses to the client.
- Log provider failures internally only.

---

## Final Implementation Prompt for an AI Coding Assistant
Use the text below as the final prompt to ask another AI to implement the feature in your SaaS.

```text
Implement a complete product marketing image generation feature in my SaaS using the OpenAI image editing API. The OpenAI API configuration is already ready in the project, so focus on the application logic, backend endpoints, service layer, prompt builder, persistence model, and frontend interaction.

Feature requirements:
- The user uploads one product image.
- The user chooses one of two styles: CHAMATIVO or CONSERVADOR.
- The system sends the original uploaded image to OpenAI and generates a new marketing version of the same product.
- The generated image must preserve the original product identity, including model, shape, packaging, proportions, colors, label structure, ingredients, quantity, and defining details.
- The system must not add text, logos, banners, price tags, stickers, or watermarks.
- CHAMATIVO style must produce a visually striking, vibrant, high-conversion advertising image with vivid colors and a creative background that matches the product.
- CONSERVADOR style must produce a clean, elegant, realistic commercial image with a neutral or soft background.
- After generation, the user can click Like or Dislike.
- If the user clicks Like, save the generated image to the gallery.
- If the user clicks Dislike, allow generating another variation using the same original image and same style.
- Regeneration must always reuse the original uploaded image, not the previously generated one.
- Persist uploaded images, generated images, generation history, like/dislike feedback, and gallery state.

Implementation details:
- Create backend endpoints for upload, generate, like, dislike, and gallery listing.
- Create application services for generation orchestration and feedback registration.
- Create a prompt builder component with a base prompt plus style-specific prompts.
- Use OpenAI image edit endpoint to submit the original image and the generated prompt.
- Save generated files in storage and persist metadata in the database.
- Add validations for supported file types and file size.
- Add proper error handling and logging.
- Keep the code clean, production-ready, and organized.

Use these prompts exactly:

Base prompt:
You are an expert commercial product photographer and high-conversion advertising creative director.
Create a new professional marketing image based on the uploaded product photo.
Preserve the product exactly as it is in the original image, including its model, shape, proportions, packaging, label structure, materials, colors, ingredients, quantity, and all defining visual characteristics.
Do not invent, remove, or replace product elements.
Do not add any text, letters, logos, price tags, stickers, badges, watermarks, or promotional banners.
Improve only the presentation, lighting, composition, realism, and commercial attractiveness.
The result must look like a real, premium, professionally photographed product advertisement.
The product must remain the clear focal point.

CHAMATIVO prompt:
Create a bold, vibrant, eye-catching advertising image designed for high sales conversion.
Make the image visually striking, polished, and creative, similar to a premium retail campaign or television commercial product shot.
Use vivid colors, dynamic but clean composition, attractive lighting, depth, contrast, and a background that matches the product category.
The image must feel highly appealing and marketable, but still realistic and professional.
No text.

CONSERVADOR prompt:
Create a conservative, elegant, clean commercial image with a neutral or soft background.
Use studio-quality lighting, balanced composition, subtle shadows, and a refined professional look.
Keep the image realistic, safe, minimal, and suitable for catalogs, marketplaces, and corporate product presentation.
No text.

Retry complement prompt:
Generate a new variation using the same product and the same style direction, but change the scene composition, camera framing, lighting arrangement, and background details while preserving the exact product identity.

Technology expectations:
- Reuse the existing OpenAI configuration already present in the project.
- Build the feature with clean architecture and clean code principles.
- Keep prompt generation isolated in its own component.
- Organize code so future styles can be added easily.
- Return production-quality code, not pseudo-code.
```

---

## Recommended Next Step
After the first version works, add:
- multiple aspect ratio options
- batch generation
- A/B testing by style
- automatic background presets by product category
- analytics dashboard for like rate and conversion rate

