// namespace TherapistDiary.Persistence.Infrastructure.ApplicationBuilderExtension;
//
// using Microsoft.AspNetCore.Builder;
//
// public static class EnvironmentConfigurationApplicationBuilderExtension
// {
//     public static IApplicationBuilder UseEnvironmentConfiguration(this IApplicationBuilder app, IWebHostEnvironment env)
//     {
//         if (env.IsDevelopment() || env.IsStaging() || env.IsEnvironment("QualityAssurance"))
//         {
//             app.UseDeveloperExceptionPage();
//             app.UseSwagger();
//             app.UseSwaggerUI(c =>
//             {
//                 c.SwaggerEndpoint("/swagger/v1/swagger.json", "WarehouseManagementSystem.WebApi v1");
//                 c.UseRequestInterceptor(
//                     @"(req) => { let cookie = {}; document.cookie.split(';').forEach(function(el) {let [key,value] = el.split('='); cookie[key.trim()] = value;}); req.headers['X-XSRF-TOKEN'] = cookie['XSRF-TOKEN']; return req; }");
//             });
//         }
//
//         return app;
//     }
// }
