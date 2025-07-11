namespace TherapistDiary.Common.Extensions;

using System.Globalization;

public static class StringExtensions
{
    public static bool IsBlanc(this string? inString) =>
        string.IsNullOrWhiteSpace(inString ?? string.Empty);

    public static bool NotBlanc(this string? inString) =>
        !IsBlanc(inString);

    public static string FirstWords(this string inString, int maxLength)
    {
        // Ensure place for the symbol ...
        var borderLength = maxLength - 3;

        if (inString.Length <= maxLength) return inString;

        var words = inString.Split(" ", StringSplitOptions.RemoveEmptyEntries);

        var resultWordList = new List<string>();

        var currentLen = 0;

        foreach (var word in words)
        {
            if (currentLen + word.Length <= borderLength)
            {
                resultWordList.Add(word);
                currentLen += word.Length + 1;
                continue;
            }

            break;
        }

        if (resultWordList.Count != 0)
        {
            resultWordList[^1] = TrimPunctuation(resultWordList[^1]) + "...";
        }

        return string.Join(" ", resultWordList);
    }

    public static string TrimPunctuation(string word)
    {
        int charToTrim = 0;
        for (int i = word.Length - 1; i > 0; i--)
        {
            if (char.IsPunctuation(word[i]))
            {
                charToTrim++;
            }
            else
            {
                break;
            }
        }

        return word[..^charToTrim];
    }

    public static string ToTitleCase(this string input)
    {
        var lowercaseString = input.ToLower();
        return input.NotBlanc() 
            ? CultureInfo.CurrentCulture.TextInfo.ToTitleCase(lowercaseString) 
            : string.Empty;
    }

    public static string ToSentenceCase(this string input)
    {
        var lowercaseString = input.ToLower();
        return input.NotBlanc() 
            ? char.ToUpper(lowercaseString[0]) + lowercaseString[1..] 
            : string.Empty;
    }
    
    public static bool IsAllUpperCase(this string input)
    {
        if (input.IsBlanc()) return false;

        foreach (var chr in input)
        {
            if (char.IsLower(chr)) return false;
        }
        
        return true;
    }
}