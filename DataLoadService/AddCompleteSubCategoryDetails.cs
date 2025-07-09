using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using DataLoadService.Common;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Collections.Generic;

namespace DataLoadService
{
    public static class AddCompleteSubCategoryDetails
    {
        [FunctionName("AddCompleteSubCategoryDetails")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function for combined subcategory data processed a request.");

            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                string connectionString = Environment.GetEnvironmentVariable("SqlConnectionString");
                if (string.IsNullOrEmpty(connectionString))
                {
                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                }

                // Extract data
                string subCategoryName = data?.subCategory?.name;
                string subCategoryDescription = data?.subCategory?.description;
                int topicId = data?.subCategory?.topicId;

                // Extract additional details (can be multiple)
                List<dynamic> additionalDetails = new List<dynamic>();
                if (data?.additionalDetails != null)
                {
                    foreach (var detail in data?.additionalDetails)
                    {
                        additionalDetails.Add(detail);
                    }
                }

                // Extract reference data (can be multiple)
                List<dynamic> referenceData = new List<dynamic>();
                if (data?.referenceData != null)
                {
                    foreach (var reference in data?.referenceData)
                    {
                        referenceData.Add(reference);
                    }
                }

                // Validate required fields
                if (string.IsNullOrEmpty(subCategoryName) || string.IsNullOrEmpty(subCategoryDescription) || topicId <= 0)
                {
                    return new BadRequestObjectResult("SubCategory information is required.");
                }

                int newSubCategoryId = -1;

                await using (SqlConnection connection = new(connectionString))
                {
                    await connection.OpenAsync();

                    // Begin transaction
                    SqlTransaction transaction = connection.BeginTransaction();

                    try
                    {
                        // 1. Insert SubCategory
                        string insertSubCategoryQuery = @"
                            INSERT INTO SubCategoryOfTopics (uid, title, description, topicid, createdBy, updatedBy, createDate, updateDate)
                            VALUES (@uid, @title, @description, @topicid, @createdBy, @updatedBy, @createDate, @updateDate);
                            SELECT SCOPE_IDENTITY();";

                        using (SqlCommand cmd = new(insertSubCategoryQuery, connection, transaction))
                        {
                            cmd.Parameters.AddWithValue("@uid", Guid.NewGuid());
                            cmd.Parameters.AddWithValue("@title", subCategoryName);
                            cmd.Parameters.AddWithValue("@description", subCategoryDescription);
                            cmd.Parameters.AddWithValue("@topicid", topicId);
                            cmd.Parameters.AddWithValue("@createdBy", 1);
                            cmd.Parameters.AddWithValue("@updatedBy", 1);
                            cmd.Parameters.AddWithValue("@createDate", DateTime.Now);
                            cmd.Parameters.AddWithValue("@updateDate", DateTime.Now);

                            // Get the new subcategory ID
                            var result = await cmd.ExecuteScalarAsync();
                            newSubCategoryId = Convert.ToInt32(result);
                        }

                        // 2. Insert Additional Details if provided
                        foreach (var detail in additionalDetails)
                        {
                            string name = detail?.name;
                            string adtdetails = detail?.adtdetails;

                            if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(adtdetails))
                            {
                                string insertDetailsQuery = @"
                                    INSERT INTO AdditionalDetails (uid, details, additionaldetails, subcategoryid, createdby, updatedby, createdate, updatedate)
                                    VALUES (@uid, @name, @adtdetails, @subcategoryid, @createdBy, @updatedBy, @createDate, @updateDate);";

                                using (SqlCommand cmd = new(insertDetailsQuery, connection, transaction))
                                {
                                    cmd.Parameters.AddWithValue("@uid", Guid.NewGuid());
                                    cmd.Parameters.AddWithValue("@name", name);
                                    cmd.Parameters.AddWithValue("@adtdetails", adtdetails);
                                    cmd.Parameters.AddWithValue("@subcategoryid", newSubCategoryId);
                                    cmd.Parameters.AddWithValue("@createdBy", 1);
                                    cmd.Parameters.AddWithValue("@updatedBy", 1);
                                    cmd.Parameters.AddWithValue("@createDate", DateTime.Now);
                                    cmd.Parameters.AddWithValue("@updateDate", DateTime.Now);

                                    await cmd.ExecuteNonQueryAsync();
                                }
                            }
                        }

                        // 3. Insert Reference Data if provided
                        foreach (var reference in referenceData)
                        {
                            string name = reference?.name;
                            string link = reference?.link;

                            if (!string.IsNullOrEmpty(name) && !string.IsNullOrEmpty(link))
                            {
                                string insertReferenceQuery = @"
                                    INSERT INTO [References] (uid, referencename, link, subcategoryid, createdBy, updatedBy, createDate, updateDate)
                                    VALUES (@uid, @name, @link, @subcategoryid, @createdBy, @updatedBy, @createDate, @updateDate);";

                                using (SqlCommand cmd = new(insertReferenceQuery, connection, transaction))
                                {
                                    cmd.Parameters.AddWithValue("@uid", Guid.NewGuid());
                                    cmd.Parameters.AddWithValue("@name", name);
                                    cmd.Parameters.AddWithValue("@link", link);
                                    cmd.Parameters.AddWithValue("@subcategoryid", newSubCategoryId);
                                    cmd.Parameters.AddWithValue("@createdBy", 1);
                                    cmd.Parameters.AddWithValue("@updatedBy", 1);
                                    cmd.Parameters.AddWithValue("@createDate", DateTime.Now);
                                    cmd.Parameters.AddWithValue("@updateDate", DateTime.Now);

                                    await cmd.ExecuteNonQueryAsync();
                                }
                            }
                        }

                        // Commit the transaction
                        transaction.Commit();

                        return new OkObjectResult(new { SubCategoryId = newSubCategoryId, Message = "Data added successfully" });
                    }
                    catch (Exception ex)
                    {
                        // Rollback the transaction if an error occurs
                        transaction.Rollback();
                        log.LogError($"Error adding combined data: {ex.Message}");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                log.LogError($"An error occurred: {ex.Message}");
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}